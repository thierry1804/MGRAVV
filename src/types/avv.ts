export type AVVStatus = 'reception' | 'analyse' | 'proposition' | 'validation' | 'cloture_gagne' | 'cloture_perdu';

export interface AVV {
  id: string;
  clientName: string;
  projectName: string;
  budget: number;
  deadline: string;
  needs: string;
  technologies: string[];
  status: AVVStatus;
  createdAt: string;
  updatedAt: string;
}