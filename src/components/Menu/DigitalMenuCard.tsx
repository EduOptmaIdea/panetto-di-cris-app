import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Minus, ChevronLeft, ShoppingCart } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const DigitalMenuCard: React.FC = () => {
    const { products } = useApp();
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();

    const product = useMemo(() => {
        return products.find(p => p.id === productId);
    }, [products, productId]);

    const [cartQuantity, setCartQuantity] = useState(1);

    const handleAddToCart = () => {
        setCartQuantity(prev => prev + 1);
    };

    const handleRemoveFromCart = () => {
        setCartQuantity(prev => (prev > 1 ? prev - 1 : 1));
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 text-gray-800 p-4 flex flex-col items-center justify-center">
                <p className="text-lg font-semibold mb-4">Produto não encontrado.</p>
                <button onClick={() => navigate('/menu')} className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                    <span>Voltar ao Menu</span>
                </button>
            </div>
        );
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const totalValue = product.price * cartQuantity;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
            {/* Imagem em destaque com o botão de voltar posicionado sobre ela */}
            <div className="relative w-full overflow-hidden">
                {product.image && (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-auto object-cover max-h-96 lg:max-w-3xl lg:mx-auto lg:rounded-b-3xl"
                    />
                )}
                {/* ✅ O degradê foi removido */}

                {/* ✅ Botão de Voltar com posição absoluta para rolar com a imagem */}
                <button
                    onClick={() => navigate('/menu')}
                    className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg z-20 text-gray-700 hover:text-orange-600 transition-colors"
                    title="Voltar ao menu"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            </div>

            {/* Container de rolagem para os detalhes do produto */}
            <div className="relative -mt-12 bg-white rounded-t-3xl shadow-xl p-6 md:p-8 flex-1 overflow-y-auto max-w-lg mx-auto w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                <div className="border-t border-gray-200 mt-4 pt-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Preço unitário</p>
                    <span className="text-2xl font-bold text-orange-600">
                        {formatCurrency(product.price)}
                    </span>
                </div>
            </div>

            {/* Barra de Ação Inferior fixa */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-top z-30">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleRemoveFromCart}
                            className="p-2 text-orange-600 hover:text-orange-800 transition-colors"
                            disabled={cartQuantity <= 1}
                        >
                            <Minus className="w-6 h-6" />
                        </button>
                        <span className="font-semibold text-xl w-6 text-center">
                            {cartQuantity}
                        </span>
                        <button
                            onClick={handleAddToCart}
                            className="p-2 text-orange-600 hover:text-orange-800 transition-colors"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                    <button
                        // onClick={handleFinalAddToCart}
                        className="flex-1 ml-4 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Adicionar</span>
                        <span className="opacity-80">|</span>
                        <span>{formatCurrency(totalValue)}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DigitalMenuCard;