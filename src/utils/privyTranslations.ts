// Traducciones para elementos de Privy que no se pueden traducir via config
export const privyTranslations: Record<string, string> = {
  // Botones de métodos de login
  'Continue with Email': 'Continuar con Email',
  'Continue with SMS': 'Continuar con SMS',
  'Continue with Phone': 'Continuar con teléfono',
  
  // Botones generales
  'Recent': 'Recientes',
  'Continue': 'Continuar',
  'Back': 'Volver',
  'Cancel': 'Cancelar',
  'Submit': 'Enviar',
  'Done': 'Listo',
  'Resend code': 'Reenviar código',
  
  // Mensajes
  'Check your email': 'Revisa tu correo',
  'Check your phone': 'Revisa tu teléfono',
  'Enter verification code': 'Ingresa el código de verificación',
  'Enter code': 'Ingresa el código',
  
  // Placeholders
  'Phone number': 'Número de teléfono',
  'Email': 'Email',
  'Enter your email': 'Ingresa tu email',
  'Enter your phone number': 'Ingresa tu número',
  
  // Términos
  'By logging in I agree to the': 'Al iniciar sesión acepto los',
  'Terms': 'Términos',
  'and': 'y',
  'Privacy Policy': 'Política de Privacidad',
  'Protected by': 'Protegido por',
  
  // Errores
  'Invalid code': 'Código inválido',
  'Code expired': 'El código ha expirado',
  'Something went wrong': 'Algo salió mal',
  'Please try again': 'Por favor intenta nuevamente',
};

// Función para traducir elementos de Privy
export function translatePrivyElements() {
  // Observar cambios en el DOM para traducir dinámicamente
  const observer = new MutationObserver(() => {
    // Traducir todos los botones y textos
    document.querySelectorAll('button, span, p, h1, h2, h3, label, input').forEach((element) => {
      const textContent = element.textContent?.trim();
      
      if (textContent && privyTranslations[textContent]) {
        // Para inputs, traducir el placeholder
        if (element instanceof HTMLInputElement && element.placeholder) {
          if (privyTranslations[element.placeholder]) {
            element.placeholder = privyTranslations[element.placeholder];
          }
        } else if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
          // Solo traducir si el elemento tiene un único nodo de texto
          element.childNodes[0].textContent = privyTranslations[textContent];
        }
      }
    });
  });

  // Observar el modal de Privy
  const privyModal = document.querySelector('[data-privy-modal]') || document.body;
  observer.observe(privyModal, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Traducir elementos existentes
  setTimeout(() => {
    document.querySelectorAll('button, span, p, h1, h2, h3, label, input').forEach((element) => {
      const textContent = element.textContent?.trim();
      
      if (textContent && privyTranslations[textContent]) {
        if (element instanceof HTMLInputElement && element.placeholder) {
          if (privyTranslations[element.placeholder]) {
            element.placeholder = privyTranslations[element.placeholder];
          }
        } else if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
          element.childNodes[0].textContent = privyTranslations[textContent];
        }
      }
    });
  }, 100);

  return () => observer.disconnect();
}
