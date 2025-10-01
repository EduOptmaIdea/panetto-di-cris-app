import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, DollarSign, Weight, CheckCircle, XCircle, ShoppingBag, Edit } from 'lucide-react';
import type { Product } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface ProductMedia {
    id: string;
    media_url: string;
    media_type: string;
    is_active: boolean;
}

interface ProductViewProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: (product: Product) => void;
    product?: Product;
}

const ProductView: React.FC<ProductViewProps> = ({ isOpen, onClose, onEdit, product }) => {
    const { categories } = useApp();
    const [medias, setMedias] = useState<ProductMedia[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<ProductMedia | null>(null);

    useEffect(() => {
        const fetchMedias = async (productId: string) => {
            const { data } = await supabase
                .from('product_medias')
                .select('id, media_url, media_type, is_active')
                .eq('product_id', productId)
                .order('display_order');

            setMedias(data || []);
            const firstActive = data?.find(m => m.is_active);
            setSelectedMedia(firstActive || data?.[0] || null);
        };

        if (isOpen && product) {
            document.body.style.overflow = 'hidden';
            fetchMedias(product.id);
        } else {
            document.body.style.overflow = 'unset';
            setMedias([]);
            setSelectedMedia(null);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || 'N/A';
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const defaultImage = 'https://xhxywfrpokrvszbasihv.supabase.co/storage/v1/object/public/product-media/panetto-imagem-nao-disponivel.webp';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full flex flex-col max-h-[90vh] relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-20">
                    <X className="w-6 h-6 text-gray-700" />
                </button>

                <div className="overflow-y-auto p-4 sm:p-6">
                    <div className="flex items-start justify-between pb-4 mb-4 border-b">
                        <div>
                            <p className="text-sm text-gray-500">{getCategoryName(product.category)}</p>
                            <h2 className="text-2xl font-bold text-gray-900 pr-12">{product.name}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="w-full">
                            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                {selectedMedia?.media_type === 'video' ? (
                                    <video key={selectedMedia.id} src={selectedMedia.media_url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                ) : (
                                    <img src={selectedMedia?.media_url || defaultImage} alt={product.name} className="w-full h-full object-cover" />
                                )}
                            </div>
                            {medias.length > 1 && (
                                <div className="grid grid-cols-5 gap-2 mt-2">
                                    {medias.map(media => (
                                        <div key={media.id} className={`aspect-square bg-gray-100 rounded-md cursor-pointer overflow-hidden ${selectedMedia?.id === media.id ? 'border-2 border-orange-500' : ''}`} onClick={() => setSelectedMedia(media)}>
                                            {media.media_type === 'video' ? (
                                                <video src={media.media_url} className={`w-full h-full object-cover ${media.is_active ? '' : 'opacity-40'}`} muted />
                                            ) : (
                                                <img src={media.media_url} alt="miniatura" className={`w-full h-full object-cover ${media.is_active ? '' : 'opacity-40'}`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col space-y-6">
                            <div><p className="text-sm font-medium text-gray-500 mb-1">Descrição</p><p className="text-gray-700 leading-relaxed">{product.description || "Nenhuma descrição fornecida."}</p></div>
                            <div className="grid grid-cols-2 gap-4 border-t pt-6">
                                <div className="flex items-center space-x-3"><DollarSign className="w-6 h-6 text-orange-500 flex-shrink-0" /><div><p className="text-sm text-gray-500">Preço</p><p className="font-semibold text-lg text-gray-900">{formatCurrency(product.price)}</p></div></div>
                                <div className="flex items-center space-x-3"><Weight className="w-6 h-6 text-gray-400 flex-shrink-0" /><div><p className="text-sm text-gray-500">Peso</p><p className="font-semibold text-lg text-gray-900">{product.weight ? `${product.weight}g` : 'N/A'}</p></div></div>
                            </div>
                            <div className="border-t pt-6">
                                <h3 className="text-base font-bold text-gray-800 mb-3">Informações Gerenciais</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">{product.isActive ? <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" /> : <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />}<div><p className="text-sm text-gray-500">Status</p><p className={`font-semibold text-lg ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>{product.isActive ? 'Ativo' : 'Inativo'}</p></div></div>
                                    <div className="flex items-center space-x-3"><ShoppingBag className="w-6 h-6 text-gray-400 flex-shrink-0" /><div><p className="text-sm text-gray-500">Total Vendido</p><p className="font-semibold text-lg text-gray-900">{product.totalSold || 0} un.</p></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 p-4 bg-gray-50 border-t rounded-b-xl mt-auto">
                    <button onClick={() => onEdit(product)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors mx-auto flex items-center justify-center" title="Editar Produto">
                        <Edit size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductView;