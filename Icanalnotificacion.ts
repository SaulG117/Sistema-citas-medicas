export enum TipoEventoClinico {
  CONFIRMACION_CITA = 'CU-01_CONFIRMACION_CITA',
  CANCELACION_CITA = 'CU-02_CANCELACION_CITA',
  RESUMEN_AGENDA_MEDICO = 'CU-03_RESUMEN_AGENDA_MEDICO',
  ACTUALIZACION_TURNOS = 'CU-04_ACTUALIZACION_TURNOS',
  RECORDATORIO_24H = 'CU-06_RECORDATORIO_24H',
}

export interface DestinatarioDTO {
  id: number;
  nombre: string;
  rol: 'PACIENTE' | 'MEDICO';
  email?: string;
  telefono?: string;
  tokenMovil?: string;
}

export interface ContextoEventoDTO {
  idCita?: number;
  fechaHora?: string;
  especialidad?: string;
  nombreContraparte?: string;
  cantidadPacientesAgenda?: number;
  bloqueHorario?: string;
}

export interface ResultadoEnvio {
  exitoso: boolean;
  evento: TipoEventoClinico;
  canalUtilizado: string;
  fechaEnvio: Date;
  mensajeGenerado: string;
  codigoReferencia?: string;
  motivoFallo?: string;
}

export interface ICanalNotificacion {
  obtenerNombreCanal(): string;
  validarDestinatario(destinatario: DestinatarioDTO): boolean;
  enviar(destinatario: DestinatarioDTO, mensaje: string): Promise<{
    exitoso: boolean;
    codigoReferencia?: string;
    motivoFallo?: string;
  }>;
}
