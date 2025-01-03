import React from 'react';
import { useAVVStore } from '../store/avvStore';
import { Clock, AlertCircle, CheckCircle2, Ban } from 'lucide-react';

export const Dashboard = () => {
  const { avvs } = useAVVStore();

  const stats = {
    total: avvs.length,
    enCours: avvs.filter(avv => ['reception', 'analyse', 'proposition'].includes(avv.status)).length,
    valide: avvs.filter(avv => avv.status === 'validation').length,
    refuse: avvs.filter(avv => avv.status === 'cloture').length,
    enRetard: avvs.filter(avv => new Date(avv.deadline) < new Date()).length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total AVV</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
          <Clock className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">En cours</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.enCours}</p>
          </div>
          <AlertCircle className="h-8 w-8 text-yellow-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Validés</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.valide}</p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Refusés</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.refuse}</p>
          </div>
          <Ban className="h-8 w-8 text-red-500" />
        </div>
      </div>
    </div>
  );
};