import React from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Calendar, DollarSign, FileText, Laptop2 } from 'lucide-react';
import { useAVVStore } from '../store/avvStore';
import { AVV } from '../types/avv';

interface EditAVVFormProps {
  avv: AVV;
  onSuccess: () => void;
}

type FormData = {
  clientName: string;
  projectName: string;
  budget: number;
  deadline: string;
  needs: string;
  technologies: string;
};

export const EditAVVForm: React.FC<EditAVVFormProps> = ({ avv, onSuccess }) => {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormData>({
    defaultValues: {
      clientName: avv.clientName,
      projectName: avv.projectName,
      budget: avv.budget,
      deadline: avv.deadline,
      needs: avv.needs,
      technologies: avv.technologies.join(', '),
    }
  });

  const { updateAVV } = useAVVStore();

  const onSubmit = async (data: FormData) => {
    try {
      await updateAVV(avv.id, {
        ...data,
        technologies: data.technologies.split(',').map(t => t.trim()),
        status: avv.status,
      });
      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const InputWrapper = ({ children, icon: Icon, label, error }: { 
    children: React.ReactNode; 
    icon: React.ComponentType<any>; 
    label: string;
    error?: string;
  }) => (
    <div className="relative group">
      <label className="block text-sm font-medium mb-1.5 text-gray-700 group-focus-within:text-indigo-600 transition-colors duration-200">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
        </div>
        {children}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );

  const baseInputClassName = `
    pl-10 w-full rounded-lg bg-white shadow-sm
    border border-gray-200 
    focus:border-indigo-500 focus:ring focus:ring-indigo-500/20
    hover:border-gray-300
    transition-all duration-200
    placeholder:text-gray-400
  `;

  const inputClassName = `${baseInputClassName} h-11`;
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <InputWrapper icon={Building2} label="Client" error={errors.clientName?.message}>
            <input
              {...register('clientName', { 
                required: 'Le nom du client est requis',
                minLength: { value: 2, message: 'Le nom doit contenir au moins 2 caractères' }
              })}
              type="text"
              className={inputClassName}
              placeholder="Nom du client"
            />
          </InputWrapper>

          <InputWrapper icon={FileText} label="Projet" error={errors.projectName?.message}>
            <input
              {...register('projectName', {
                required: 'Le nom du projet est requis',
                minLength: { value: 2, message: 'Le nom doit contenir au moins 2 caractères' }
              })}
              type="text"
              className={inputClassName}
              placeholder="Nom du projet"
            />
          </InputWrapper>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputWrapper icon={DollarSign} label="Budget (€)" error={errors.budget?.message}>
            <input
              {...register('budget', { 
                required: 'Le budget est requis',
                min: { value: 0, message: 'Le budget doit être positif' },
                valueAsNumber: true
              })}
              type="number"
              className={inputClassName}
              placeholder="Montant en euros"
            />
          </InputWrapper>

          <InputWrapper icon={Calendar} label="Échéance" error={errors.deadline?.message}>
            <input
              {...register('deadline', { required: 'La date d\'échéance est requise' })}
              type="date"
              className={inputClassName}
            />
          </InputWrapper>
        </div>

        <div className="relative group">
          <label className="block text-sm font-medium mb-1.5 text-gray-700 group-focus-within:text-indigo-600 transition-colors duration-200">
            Besoins
          </label>
          <textarea
            {...register('needs', {
              required: 'La description des besoins est requise',
              minLength: { value: 10, message: 'La description doit contenir au moins 10 caractères' }
            })}
            rows={4}
            className={`${baseInputClassName} pl-3 resize-none`}
            placeholder="Description détaillée des besoins du projet..."
          />
          {errors.needs?.message && (
            <p className="mt-1 text-sm text-red-500">{errors.needs.message}</p>
          )}
        </div>

        <InputWrapper icon={Laptop2} label="Technologies (séparées par des virgules)" error={errors.technologies?.message}>
          <input
            {...register('technologies', {
              required: 'Les technologies sont requises',
              pattern: {
                value: /^[A-Za-z0-9\s,.-]+$/,
                message: 'Format invalide. Utilisez des virgules pour séparer les technologies'
              }
            })}
            type="text"
            className={inputClassName}
            placeholder="React, Node.js, TypeScript"
          />
        </InputWrapper>
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6 p-6 bg-white border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-3 px-4 rounded-lg 
            hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
            transform transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:translate-y-0 font-medium text-sm shadow-sm hover:shadow-md"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Mise à jour en cours...
            </span>
          ) : (
            "Mettre à jour l'avant-projet"
          )}
        </button>
      </div>
    </form>
  );
}; 