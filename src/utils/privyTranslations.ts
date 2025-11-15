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
  let isTranslating = false;

  // Función para traducir un elemento específico
  const translateElement = (element: Element) => {
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
  };

  // Observar cambios en el DOM para traducir dinámicamente (con throttling)
  const observer = new MutationObserver((mutations) => {
    if (isTranslating) return;
    
    isTranslating = true;
    
    // Solo procesar mutaciones que agreguen nodos
    const addedNodes = mutations
      .filter(m => m.type === 'childList' && m.addedNodes.length > 0)
      .flatMap(m => Array.from(m.addedNodes))
      .filter(node => node.nodeType === Node.ELEMENT_NODE);

    if (addedNodes.length === 0) {
      isTranslating = false;
      return;
    }

    // Traducir solo los elementos agregados
    requestAnimationFrame(() => {
      addedNodes.forEach((node) => {
        if (node instanceof Element) {
          // Traducir el elemento y sus hijos
          if (node.matches('button, span, p, h1, h2, h3, label, input')) {
            translateElement(node);
          }
          
          // Traducir elementos hijos relevantes
          const relevantChildren = node.querySelectorAll('button, span, p, h1, h2, h3, label, input');
          relevantChildren.forEach(translateElement);
        }
      });
      
      isTranslating = false;
    });
  });

  // Solo observar dentro de elementos de Privy o modales
  const observePrivyElements = () => {
    // Buscar el modal de Privy específicamente
    const privyModal = document.querySelector('[role="dialog"]') || 
                      document.querySelector('[data-privy-modal]') ||
                      document.querySelector('#headlessui-portal-root');
    
    if (privyModal) {
      observer.observe(privyModal, {
        childList: true,
        subtree: true,
      });
    }
  };

  // Iniciar observación
  observePrivyElements();

  // Re-observar si aparece un nuevo modal
  const portalObserver = new MutationObserver(() => {
    observePrivyElements();
  });
  
  portalObserver.observe(document.body, {
    childList: true,
  });

  // Traducir elementos existentes (solo una vez)
  setTimeout(() => {
    const privyElements = document.querySelectorAll('[role="dialog"] button, [role="dialog"] span, [role="dialog"] p, [role="dialog"] input');
    privyElements.forEach(translateElement);
  }, 100);

  return () => {
    observer.disconnect();
    portalObserver.disconnect();
  };
}
