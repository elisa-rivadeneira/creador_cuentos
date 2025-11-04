export interface FormData {
  tema: string;
  grado: string;
  area: string;
  formatoImagen: 'cabecera' | 'lado' | 'cuadrado';
}

export interface StoryResult {
  cuentoUrl: string;
  fichaUrl: string;
  tema: string;
  grado: string;
  area: string;
}