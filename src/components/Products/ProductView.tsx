import React, { useMemo } from 'react';
import { X, DollarSign, Tag, Weight, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import type { Product } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProductViewProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product;
}

const ProductView: React.FC<ProductViewProps> = ({ isOpen, onClose, product }) => {
    const { categories, orders } = useApp();

    // ✅ Calcular as 10 últimas vendas para o produto
    const recentSales = useMemo(() => {
        if (!product) return [];

        const allSales: { date: Date; total: number }[] = [];
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.productId === product.id && order.orderDate) {
                    allSales.push({
                        date: new Date(order.orderDate),
                        total: item.total
                    });
                }
            });
        });

        return allSales.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
    }, [product, orders]);

    if (!isOpen || !product) return null;

    const getCategoryName = (categoryId: string) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category?.name || 'Categoria não encontrada';
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Imagem do Produto */}
                    {product.image && (
                        <div className="mb-4 flex justify-center">
                            <img src={product.image} alt={product.name} className="w-full sm:w-1/2 h-auto rounded-lg" />
                        </div>
                    )}

                    {/* Informações Principais */}
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Descrição</p>
                            <p className="text-gray-700">{product.description}</p>
                        </div>
                    </div>

                    {/* Métricas e Detalhes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-6">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="w-5 h-5 text-red-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Preço</p>
                                <p className="font-semibold text-red-600">{formatCurrency(product.price)}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Tag className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Categoria</p>
                                <p className="font-semibold text-gray-900">{getCategoryName(product.category)}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Weight className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Peso</p>
                                <p className="font-semibold text-gray-900">{product.weight}g</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {product.isActive ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <p className={`font-semibold ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                    {product.isActive ? 'Ativo' : 'Inativo'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Vendas Totais */}
                    <div className="flex items-center space-x-2 border-t pt-6">
                        <ShoppingBag className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Vendido</p>
                            <p className="font-semibold text-gray-900">{product.totalSold} unidade(s)</p>
                        </div>
                    </div>

                    {/* Últimas Vendas */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Últimas 10 Vendas</h3>
                        {recentSales.length > 0 ? (
                            <ul className="space-y-2 max-h-40 overflow-y-auto">
                                {recentSales.map((sale, index) => (
                                    <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm">
                                        <span className="text-gray-700">Venda em {format(sale.date, 'dd/MM/yyyy', { locale: ptBR })}</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(sale.total)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm italic">Nenhuma venda recente.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductView;