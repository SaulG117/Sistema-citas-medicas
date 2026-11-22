import { EstrategiaEmail, EstrategiaPush, EstrategiaSMS } from './EstrategiasCanal';
import {
  ContextoEventoDTO,
  DestinatarioDTO,
  ICanalNotificacion,
  ResultadoEnvio,
  TipoEventoClinico,
} from './ICanalNotificacion';
import { ServicioNotificacion } from './ServicioNotificacion';

export type CanalPreferido = 'EMAIL' | 'SMS' | 'PUSH_MOVIL';

export class GestionCitasController {
  private resolverEstrategia(canal: CanalPreferido): ICanalNotificacion {
    switch (canal) {
      case 'SMS':
        return new EstrategiaSMS();
      case 'PUSH_MOVIL':
        return new EstrategiaPush();
      case 'EMAIL':
      default:
        return new EstrategiaEmail();
    }
  }

  public async notificarEventoClinico(
    evento: TipoEventoClinico,
    destinatario: DestinatarioDTO,
    contexto: ContextoEventoDTO,
    canalPreferido: CanalPreferido,
    habilitarRespaldoEmail = false
  ): Promise<ResultadoEnvio> {
    const estrategiaInicial = this.resolverEstrategia(canalPreferido);
    const servicio = new ServicioNotificacion(estrategiaInicial);

    let resultado = await servicio.procesarNotificacion(evento, destinatario, contexto);

    // Conmutación dinámica en tiempo de ejecución si el canal principal falla
    if (!resultado.exitoso && habilitarRespaldoEmail && canalPreferido !== 'EMAIL') {
      servicio.setEstrategiaCanal(new EstrategiaEmail());
      resultado = await servicio.procesarNotificacion(evento, destinatario, contexto);
    }

    return resultado;
  }
}
