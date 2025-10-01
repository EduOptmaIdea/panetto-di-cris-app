import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { X, Package, DollarSign, FileText, Tag, Weight, UploadCloud, Trash2, AlertCircle, Eye, EyeOff, GripVertical } from 'lucide-react';
import CurrencyInput from 'react-currency-input-field';
import { useDropzone } from 'react-dropzone';
import type { Product } from '../../types/index';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ExistingMedia {
  id: string;
  media_url: string;
  media_type: string;
  is_active: boolean;
  display_order: number;
}

interface MediaFile extends File {
  preview: string;
}

const SortableMediaItem: React.FC<{ media: ExistingMedia, onToggleActive: () => void, onDelete: () => void }> = ({ media, onToggleActive, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: media.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="relative group aspect-square touch-none bg-gray-100 rounded-md overflow-hidden">
      {media.media_type === 'video' ? (
        <video src={media.media_url} className={`w-full h-full object-cover ${media.is_active ? '' : 'opacity-40'}`} muted loop />
      ) : (
        <img src={media.media_url} alt="Mídia existente" className={`w-full h-full object-cover ${media.is_active ? '' : 'opacity-40'}`} />
      )}
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" {...attributes} {...listeners} className="text-white p-1 cursor-grab active:cursor-grabbing"><GripVertical size={20} /></button>
        <button type="button" onClick={onToggleActive} className="text-white p-1 rounded-full hover:bg-white/20" title={media.is_active ? "Desativar" : "Ativar"}>{media.is_active ? <Eye size={18} /> : <EyeOff size={18} />}</button>
        <button type="button" onClick={onDelete} className="text-white p-1 rounded-full hover:bg-white/20" title="Excluir"><Trash2 size={16} /></button>
      </div>
    </div>
  );
};

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  isEditing?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, product, isEditing = false }) => {
  const { addProduct, updateProduct, categories, refetch, addNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<string | undefined>(undefined);
  const [weight, setWeight] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [existingMedias, setExistingMedias] = useState<ExistingMedia[]>([]);
  const [newMediaFiles, setNewMediaFiles] = useState<MediaFile[]>([]);

  const resetForm = useCallback(() => {
    setName(''); setDescription(''); setCategory(''); setPrice(undefined);
    setWeight(''); setIsActive(true); setNewMediaFiles([]); setExistingMedias([]); setError(null);
  }, []);

  useEffect(() => {
    const fetchMedias = async (productId: string) => {
      const { data, error } = await supabase.from('product_medias').select('id, media_url, media_type, is_active, display_order').eq('product_id', productId).order('display_order');
      if (error) console.error("Erro ao buscar mídias:", error);
      else setExistingMedias(data || []);
    };
    if (isOpen) {
      if (isEditing && product) {
        setName(product.name); setDescription(product.description || ''); setCategory(product.category);
        setPrice(String(product.price)); setWeight(String(product.weight || '')); setIsActive(product.isActive);
        setNewMediaFiles([]); fetchMedias(product.id);
      } else { resetForm(); }
    }
  }, [isOpen, isEditing, product, resetForm]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }));
    setNewMediaFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'video/mp4': [] }
  });

  const removeNewFile = (fileToRemove: MediaFile) => {
    setNewMediaFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const deleteExistingMedia = async (media: ExistingMedia) => {
    const filePath = media.media_url.split('/product-media/')[1];
    await supabase.storage.from('product-media').remove([filePath]);
    await supabase.from('product_medias').delete().eq('id', media.id);
    setExistingMedias(prev => prev.filter(m => m.id !== media.id));
  };

  const toggleMediaActive = async (mediaId: string, currentState: boolean) => {
    await supabase.from('product_medias').update({ is_active: !currentState }).eq('id', mediaId);
    setExistingMedias(prev => prev.map(media => media.id === mediaId ? { ...media, is_active: !currentState } : media));
  };

  const uploadMedia = async (file: File, productId: string, order: number) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `media-files/${fileName}`;
    const mediaType = file.type.startsWith('video') ? 'video' : 'image';
    await supabase.storage.from('product-media').upload(filePath, file);
    const { data: { publicUrl } } = supabase.storage.from('product-media').getPublicUrl(filePath);
    await supabase.from('product_medias').insert({
      product_id: productId, media_url: publicUrl, media_type: mediaType, alt_text: name,
      display_order: order, is_active: true,
    });
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const priceAsNumber = parseFloat(price?.replace('.', '').replace(',', '.') || '0');

    try {
      let productId = product?.id;
      if (!isEditing) {
        const newProduct = await addProduct({ name, description, category, price: priceAsNumber, weight: Number(weight), isActive, image: '' });
        if (newProduct) productId = newProduct.id;
        else throw new Error("Não foi possível criar o produto.");
      }
      if (!productId) throw new Error("ID do produto é inválido.");

      if (newMediaFiles.length > 0) {
        let currentOrder = existingMedias.length;
        for (const file of newMediaFiles) {
          currentOrder++;
          await uploadMedia(file, productId, currentOrder);
        }
      }

      const mediaUpdates = existingMedias.map((media, index) => ({ id: media.id, display_order: index + 1 }));
      if (mediaUpdates.length > 0) await supabase.from('product_medias').upsert(mediaUpdates);

      const allMedias = (await supabase.from('product_medias').select('media_url, is_active').eq('product_id', productId).order('display_order')).data || [];
      const newPrimaryMedia = allMedias.find(media => media.is_active);
      const primaryImageUrl = newPrimaryMedia ? newPrimaryMedia.media_url : null;
      await updateProduct(productId, { name, description, category, price: priceAsNumber, weight: Number(weight), isActive, image: primaryImageUrl });

      addNotification({ title: 'Sucesso!', message: `Produto ${isEditing ? 'atualizado' : 'criado'} com sucesso.`, type: 'success' });
      await refetch();
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      setError(`Erro: ${error.message}`);
      addNotification({ title: 'Erro ao Salvar', message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setExistingMedias((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label><div className="relative"><Package size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" required autoComplete="off" /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label><div className="relative"><FileText size={20} className="absolute left-3 top-3 text-gray-400" /><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"></textarea></div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label><div className="relative"><Tag size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none" required><option value="">Selecione</option>{categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select></div></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Peso (g)</label><div className="relative"><Weight size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" autoComplete="off" /></div></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Preço</label><div className="relative"><DollarSign size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><CurrencyInput id="price" name="price" value={price} onValueChange={(value) => setPrice(value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" intlConfig={{ locale: 'pt-BR', currency: 'BRL' }} decimalScale={2} required autoComplete="off" /></div></div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Mídias do Produto</label>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={existingMedias.map(m => m.id)} strategy={rectSortingStrategy}>
                  {existingMedias.length > 0 && (<div className="p-2 border rounded-lg"><p className="text-xs font-semibold text-gray-600 mb-2">Mídias Atuais (arraste para reordenar)</p><div className="grid grid-cols-3 sm:grid-cols-4 gap-2">{existingMedias.map((media) => (<SortableMediaItem key={media.id} media={media} onDelete={() => deleteExistingMedia(media)} onToggleActive={() => toggleMediaActive(media.id, media.is_active)} />))}</div></div>)}
                </SortableContext>
              </DndContext>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'}`}><input {...getInputProps()} /><UploadCloud className="mx-auto h-12 w-12 text-gray-400" /><p className="mt-2 text-sm text-gray-600">Arraste e solte ou clique para adicionar novas mídias</p><p className="text-xs text-gray-500">Imagens (WEBP, PNG, JPG) e Vídeos (MP4)</p></div>
              {newMediaFiles.length > 0 && (<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">{newMediaFiles.map((file, index) => (<div key={index} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                {file.type.startsWith('video') ? (<video src={file.preview} className="w-full h-full object-cover" autoPlay muted loop />) : (<img src={file.preview} alt="Prévia" className="w-full h-full object-cover" onLoad={() => URL.revokeObjectURL(file.preview)} />)}
                <button type="button" onClick={() => removeNewFile(file)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><Trash2 size={12} /></button>
              </div>))}</div>)}
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2"><input type="checkbox" id="isActive" name="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded" /><label htmlFor="isActive" className="text-sm font-medium text-gray-700">Produto ativo (visível no menu)</label></div>
          {error && <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-700 rounded-lg"><AlertCircle size={20} /><p>{error}</p></div>}
          <div className="flex space-x-3 pt-4 border-t"><button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button><button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-200 disabled:opacity-50">{loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Produto')}</button></div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;