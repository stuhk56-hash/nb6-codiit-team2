export interface UserGradeDto {
  name: string;
  id: string;
  rate: number;
  minAmount: number;
  isGreenGrade: boolean;
  label: string;
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  type: 'SELLER' | 'BUYER';
  points: number;
  createdAt: string;
  updatedAt: string;
  grade?: UserGradeDto | null;
  image: unknown;
}
