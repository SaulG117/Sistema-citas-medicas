import { DestinatarioDTO, ICanalNotificacion } from './ICanalNotificacion';

export class EstrategiaEmail implements ICanalNotificacion {
  public obtenerNombreCanal(): string {
    return 'EMAIL';
  }

  public validarDestinatario(destinatario: DestinatarioDTO): boolean {
    if (!destinatario.email) return false;
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return patronEmail.test(destinatario.email.trim());
  }

  public async enviar(destinatario: DestinatarioDTO, mensaje: string) {
    if (!this.validarDestinatario(destinatario)) {
      return {
        exitoso: false,
        motivoFallo: 'Correo electrónico inválido o no registrado.',
      };
    }

    return {
      exitoso: true,
      codigoReferencia: `SMTP-destinatario.id-{Date.now()}`,
    };
  }
}

export class EstrategiaSMS implements ICanalNotificacion {
  public obtenerNombreCanal(): string {
    return 'SMS';
  }

  public validarDestinatario(destinatario: DestinatarioDTO): boolean {
    if (!destinatario.telefono) return false;
    // Formato estándar internacional E.164 para República Dominicana
    const patronSms = /^\+1(809|829|849)\d{7}$/;
    return patronSms.test(destinatario.telefono.trim());
  }

  public async enviar(destinatario: DestinatarioDTO, mensaje: string) {
    if (!this.validarDestinatario(destinatario)) {
      return {
        exitoso: false,
        motivoFallo: 'Número telefónico inválido para pasarela SMS.',
      };
    }

    const textoAjustado = mensaje.slice(0, 160);
    if (textoAjustado.length === 0) {
      return { exitoso: false, motivoFallo: 'El cuerpo del mensaje SMS está vacío.' };
    }

    return {
      exitoso: true,
      codigoReferencia: `SMS-destinatario.id-{Date.now()}`,
    };
  }
}

export class EstrategiaPush implements ICanalNotificacion {
  public obtenerNombreCanal(): string {
    return 'PUSH_MOVIL';
  }

  public validarDestinatario(destinatario: DestinatarioDTO): boolean {
    return Boolean(destinatario.tokenMovil && destinatario.tokenMovil.trim().length >= 10);
  }

  public async enviar(destinatario: DestinatarioDTO, mensaje: string) {
    if (!this.validarDestinatario(destinatario)) {
      return {
        exitoso: false,
        motivoFallo: 'Token de dispositivo móvil inactivo o inválido.',
      };
    }

    return {
      exitoso: true,
      codigoReferencia: `PUSH-destinatario.id-{Date.now()}`,
    };
  }
}
