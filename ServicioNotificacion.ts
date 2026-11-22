import {
  ContextoEventoDTO,
  DestinatarioDTO,
  ICanalNotificacion,
  ResultadoEnvio,
  TipoEventoClinico,
} from './ICanalNotificacion';

export class ServicioNotificacion {
  private estrategiaCanal: ICanalNotificacion;
  private historialAuditorias: ResultadoEnvio[] = [];

  constructor(estrategiaInicial: ICanalNotificacion) {
    this.estrategiaCanal = estrategiaInicial;
  }

  public setEstrategiaCanal(nuevaEstrategia: ICanalNotificacion): void {
    this.estrategiaCanal = nuevaEstrategia;
  }

  public obtenerCanalActivo(): string {
    return this.estrategiaCanal.obtenerNombreCanal();
  }

  public formatearMensajeEvento(
    evento: TipoEventoClinico,
    destinatario: DestinatarioDTO,
    contexto: ContextoEventoDTO
  ): string {
    switch (evento) {
      case TipoEventoClinico.CONFIRMACION_CITA:
        return `Confirmación Cita #${contexto.idCita}: Estimado/a ${destinatario.nombre}, su consulta de ${contexto.especialidad} con ${contexto.nombreContraparte} quedó agendada para el ${contexto.fechaHora}.`;

      case TipoEventoClinico.CANCELACION_CITA:
        return `Aviso de Cancelación Cita #${contexto.idCita}: ${destinatario.nombre}, la cita programada para el ${contexto.fechaHora} ha sido cancelada y el horario fue liberado.`;

      case TipoEventoClinico.RESUMEN_AGENDA_MEDICO:
        return `Agenda Médica (${contexto.fechaHora}): Dr./Dra. ${destinatario.nombre}, tiene ${contexto.cantidadPacientesAgenda ?? 0} pacientes programados en su jornada.`;

      case TipoEventoClinico.ACTUALIZACION_TURNOS:
        return `Actualización de Horarios: Dr./Dra. destinatario.nombre,sehahabilitadosubloquedeatención({contexto.bloqueHorario}) en el sistema.`;

      case TipoEventoClinico.RECORDATORIO_24H:
      default:
        return `Recordatorio 24h: Hola ${destinatario.nombre}, le recordamos su cita de ${contexto.especialidad} con ${contexto.nombreContraparte} mañana ${contexto.fechaHora}.`;
    }
  }

  public async procesarNotificacion(
    evento: TipoEventoClinico,
    destinatario: DestinatarioDTO,
    contexto: ContextoEventoDTO
  ): Promise<ResultadoEnvio> {
    const mensajeGenerado = this.formatearMensajeEvento(evento, destinatario, contexto);
    const respuestaCanal = await this.estrategiaCanal.enviar(destinatario, mensajeGenerado);

    const registro: ResultadoEnvio = {
      exitoso: respuestaCanal.exitoso,
      evento,
      canalUtilizado: this.estrategiaCanal.obtenerNombreCanal(),
      fechaEnvio: new Date(),
      mensajeGenerado,
      codigoReferencia: respuestaCanal.codigoReferencia,
      motivoFallo: respuestaCanal.motivoFallo,
    };

    this.historialAuditorias.push(registro);
    return registro;
  }

  public obtenerHistorialAuditorias(): ResultadoEnvio[] {
    return [...this.historialAuditorias];
  }
}
