import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
  description: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  description,
  icon: Icon = Construction
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-12 h-12 text-orange-500" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
      <p className="text-gray-600 max-w-md mb-8">{description}</p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Em desenvolvimento</h3>
        <p className="text-sm text-gray-600">
          Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
          Continue explorando as outras áreas do sistema!
        </p>
      </div>
    </div>
  );
};

export default PlaceholderView;