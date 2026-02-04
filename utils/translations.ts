
export type UILanguage = 'pt' | 'en' | 'es';

export const translations = {
  pt: {
    appTitle: "JSON Builder Pro",
    tabs: {
      basics: "Básico",
      smart: "Smart Split",
      upload: "Imagem"
    },
    basics: {
      title: "Identificação",
      subtitle: "Metadados da lição",
      weekTitle: "Título da Semana",
      lessonTitle: "Título da Lição Diária",
      weekNumber: "Semana #",
      language: "Idioma",
      dayNumber: "Dia #",
      dayName: "Nome do Dia",
      ready: "PRONTO",
      select: "Selecionar...",
      days: ["Sábado", "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
    },
    smart: {
      title: "Editor de Foco",
      subtitle: "Segmentação inteligente com cursor automático",
      divide: "Dividir",
      reset: "Resetar editor?",
      workspace: "Espaço de Trabalho",
      classify: "Classificar Bloco",
      content: "Conteúdo:",
      t: "Título",
      x: "Texto",
      q: "Pergunta",
      cancel: "Cancelar (ESC)",
      blockEditor: "Editor de Blocos",
      emptyState: "Use o editor à direita para criar blocos automaticamente",
      addBlock: "Adicionar Bloco Extra",
      updateTable: "Salvar Alterações",
      generateTable: "JSON Code",
      focusEdit: "Modo Foco",
      save: "Salvar Alterações",
      modalTitle: "Editar Bloco"
    },
    table: {
      preview: "Prévia do JSON",
      rows: "Blocos",
      clear: "Limpar Tudo",
      empty: "-- vazio --",
      confirmClear: "Deseja limpar todos os blocos e informações atuais?",
      deleteColConfirm: "Deseja remover este item?"
    },
    preview: {
      button: "Simular Lição",
      title: "Simulação da Experiência do Usuário",
      subtitle: "Veja exatamente como os blocos serão apresentados no aplicativo final. Clique em qualquer texto para corrigir.",
      inputPlaceholder: "O aluno digitará a resposta aqui...",
      close: "Fechar Simulação"
    },
    upload: {
      analyzing: "Analisando Imagem...",
      extracting: "Extraindo texto e estrutura",
      processing: "Processando",
      cancel: "Cancelar Processo",
      title: "Upload de Imagem do Guia",
      subtitle: "Arraste e solte ou clique para procurar",
      selectFile: "Selecionar Arquivo",
      support: "Suporta JPG, PNG"
    },
    export: {
      json: "Download JSON",
      csv: "Download CSV",
      weekRequired: "O campo Week Number é obrigatório."
    },
    welcome: {
      title: "Inicie seu Projeto",
      description: "Carregue uma imagem ou clique em Smart Split para começar a organizar seu conteúdo."
    },
    mobileBlock: {
      title: "Acesso Restrito",
      message: "Este aplicativo foi projetado exclusivamente para uso em computadores desktop."
    }
  },
  en: {
    appTitle: "JSON Builder Pro",
    tabs: {
      basics: "Basics",
      smart: "Smart Split",
      upload: "Image"
    },
    basics: {
      title: "Basics",
      subtitle: "Fundamental lesson information",
      weekTitle: "Week Title",
      lessonTitle: "Daily Lesson Title",
      weekNumber: "Week #",
      language: "Language",
      dayNumber: "Day #",
      dayName: "Day Name",
      ready: "READY",
      select: "Select...",
      days: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    },
    smart: {
      title: "Focus Editor",
      subtitle: "Smart segmentation with auto-cursor",
      divide: "Divide",
      reset: "Reset editor?",
      workspace: "Workspace",
      classify: "Classify Block",
      content: "Content:",
      t: "Title",
      x: "Text",
      q: "Question",
      cancel: "Cancel (ESC)",
      blockEditor: "Block Editor",
      emptyState: "Use the editor on the right to create blocks automatically",
      addBlock: "Add Extra Block",
      updateTable: "Save Changes",
      generateTable: "JSON Code",
      focusEdit: "Focus Mode",
      save: "Save Changes",
      modalTitle: "Edit Block"
    },
    table: {
      preview: "JSON Preview",
      rows: "Blocks",
      clear: "Clear All",
      empty: "-- empty --",
      confirmClear: "Do you want to clear all blocks and information?",
      deleteColConfirm: "Do you want to remove this item?"
    },
    preview: {
      button: "Simulate Lesson",
      title: "User Experience Simulation",
      subtitle: "See exactly how blocks will be presented in the final app. Click any text to fix typos.",
      inputPlaceholder: "Student will type answer here...",
      close: "Close Simulation"
    },
    upload: {
      analyzing: "Analyzing Image...",
      extracting: "Extracting text and structure",
      processing: "Processing",
      cancel: "Cancel Process",
      title: "Upload Guide Image",
      subtitle: "Drag & drop or click to browse",
      selectFile: "Select File",
      support: "Supports JPG, PNG"
    },
    export: {
      json: "Download JSON",
      csv: "Download CSV",
      weekRequired: "The Week Number field is required."
    },
    welcome: {
      title: "Start Your Project",
      description: "Upload an image or click on Smart Split to start organizing your content."
    },
    mobileBlock: {
      title: "Access Restricted",
      message: "This application is designed exclusively for desktop use."
    }
  },
  es: {
    appTitle: "JSON Builder Pro",
    tabs: {
      basics: "Básico",
      smart: "Smart Split",
      upload: "Imagen"
    },
    basics: {
      title: "Básico",
      subtitle: "Información fundamental de la lección",
      weekTitle: "Título de la Semana",
      lessonTitle: "Título de la Lección Diaria",
      weekNumber: "Semana #",
      language: "Idioma",
      dayNumber: "Día #",
      dayName: "Nombre del Día",
      ready: "LISTO",
      select: "Seleccionar...",
      days: ["Sábado", "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    },
    smart: {
      title: "Editor de Enfoque",
      subtitle: "Segmentación inteligente con cursor automático",
      divide: "Dividir",
      reset: "¿Reiniciar editor?",
      workspace: "Espacio de Trabalho",
      classify: "Clasificar Bloque",
      content: "Contenido:",
      t: "Título",
      x: "Texto",
      q: "Pregunta",
      cancel: "Cancelar (ESC)",
      blockEditor: "Editor de Blocos",
      emptyState: "Usa el editor de la derecha para crear bloques automáticamente",
      addBlock: "Añadir Bloque Extra",
      updateTable: "Guardar Cambios",
      generateTable: "JSON Code",
      focusEdit: "Modo Enfoque",
      save: "Guardar Cambios",
      modalTitle: "Editar Bloco"
    },
    table: {
      preview: "Vista Previa JSON",
      rows: "Bloques",
      clear: "Limpiar Todo",
      empty: "-- vacío --",
      confirmClear: "¿Deseas limpiar todos los bloques e información actual?",
      deleteColConfirm: "¿Deseas eliminar este item?"
    },
    preview: {
      button: "Simular Lección",
      title: "Simulación de Experiencia de Usuario",
      subtitle: "Vea exactamente cómo se presentarán los bloques en la aplicación final. Haga clic en cualquier texto para corregir.",
      inputPlaceholder: "El estudiante escribirá la respuesta aquí...",
      close: "Cerrar Simulación"
    },
    upload: {
      analyzing: "Analizando Imagen...",
      extracting: "Extrayendo texto y estrutura",
      processing: "Procesando",
      cancel: "Cancelar Proceso",
      title: "Cargar Imagen",
      subtitle: "Arrastra y suelta o haz clic para buscar",
      selectFile: "Selecionar Arquivo",
      support: "Soporta JPG, PNG"
    },
    export: {
      json: "Descargar JSON",
      csv: "Descargar CSV",
      weekRequired: "O campo Week Number é obrigatório."
    },
    welcome: {
      title: "Inicie su Proyecto",
      description: "Cargue una imagen o haga clic en Smart Split para comenzar a organizar su contenido."
    },
    mobileBlock: {
      title: "Acceso Restringido",
      message: "Esta aplicación está diseñada exclusivamente para uso en computadoras de escritorio."
    }
  }
};
