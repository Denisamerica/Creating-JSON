
export type UILanguage = 'pt' | 'en' | 'es';

export const translations = {
  pt: {
    appTitle: "StudyGuide Builder",
    modeJson: "JSON Builder",
    modeCsv: "CSV Builder",
    tabs: {
      basics: "Básico",
      smart: "Smart Split",
      upload: "Imagem",
      csvEntry: "Nova Linha",
      csvTable: "Tabela CSV",
      files: "Arquivos"
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
      week: "Semana",
      day: "Dia",
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
      i: "Input",
      cancel: "Cancelar (ESC)",
      blockEditor: "Editor de Blocos",
      emptyState: "Use o editor à direita para criar blocos automaticamente",
      addBlock: "Adicionar Bloco Extra",
      updateTable: "Salvar Alterações",
      generateTable: "JSON Code",
      focusEdit: "Modo Foco",
      save: "Salvar Alterações",
      modalTitle: "Editar Bloco",
      editCode: "Editar o Código",
      saveCode: "Salvar Código",
      saveAndViewJson: "Salvar e Ver JSON",
      syncToBlocks: "Sincronizar com Blocos"
    },
    table: {
      preview: "Prévia da Tabela",
      rows: "Linhas",
      clear: "Limpar Tudo",
      empty: "-- vazio --",
      confirmClear: "Deseja limpar todos os dados atuais?",
      deleteColConfirm: "Deseja remover este item?",
      exportCsv: "Exportar CSV"
    },
    preview: {
      button: "Simular Lição",
      title: "Simulação da Experiência do Usuário",
      subtitle: "Veja exatamente como os blocos serão apresentados no aplicativo final.",
      inputPlaceholder: "O aluno digitará a resposta aqui...",
      close: "Fechar Simulação"
    },
    upload: {
      analyzing: "Analisando Imagem...",
      extracting: "Extraindo texto e estrutura",
      processing: "Processando",
      cancel: "Cancelar Processo",
      title: "Upload de Imagem",
      subtitle: "Arraste e solte ou clique para procurar",
      selectFile: "Selecionar Arquivo",
      support: "Suporta JPG, PNG"
    },
    export: {
      json: "Download JSON",
      csv: "Download CSV",
      weekRequired: "O campo Week Number é obrigatório."
    },
    notes: {
      button: "Notas",
      title: "Bloco de Notas & Histórico",
      currentTab: "Rascunho Atual",
      historyTab: "Arquivo de Notas",
      placeholder: "Escreva observações aqui. Esta nota será salva automaticamente ao resetar ou exportar.",
      emptyHistory: "Nenhuma nota arquivada ainda.",
      date: "Data",
      content: "Conteúdo",
      actions: "Ações",
      save: "Salvar",
      delete: "Excluir",
      deleteAll: "Excluir Tudo",
      edit: "Editar",
      source: "Origem"
    },
    importJson: {
      button: "Abrir JSON",
      title: "Arquivos JSON",
      subtitle: "Clique para carregar no editor",
      empty: "Nenhum arquivo carregado",
      load: "Carregar no Editor",
      remove: "Remover"
    }
  },
  en: {
    appTitle: "StudyGuide Builder",
    modeJson: "JSON Builder",
    modeCsv: "CSV Builder",
    tabs: {
      basics: "Basics",
      smart: "Smart Split",
      upload: "Image",
      csvEntry: "New Row",
      csvTable: "CSV Table",
      files: "Files"
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
      week: "Week",
      day: "Day",
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
      i: "Input",
      cancel: "Cancel (ESC)",
      blockEditor: "Block Editor",
      emptyState: "Use the editor on the right to create blocks automatically",
      addBlock: "Add Extra Block",
      updateTable: "Save Changes",
      generateTable: "JSON Code",
      focusEdit: "Focus Mode",
      save: "Save Changes",
      modalTitle: "Edit Block",
      editCode: "Edit the Code",
      saveCode: "Save Code",
      saveAndViewJson: "Save & View JSON",
      syncToBlocks: "Sync to Blocks"
    },
    table: {
      preview: "Table Preview",
      rows: "Rows",
      clear: "Clear All",
      empty: "-- empty --",
      confirmClear: "Do you want to clear all current data?",
      deleteColConfirm: "Do you want to remove this item?",
      exportCsv: "Export CSV"
    },
    preview: {
      button: "Simulate Lesson",
      title: "User Experience Simulation",
      subtitle: "See exactly how blocks will be presented in the final app.",
      inputPlaceholder: "Student will type answer here...",
      close: "Close Simulation"
    },
    upload: {
      analyzing: "Analyzing Image...",
      extracting: "Extracting text and structure",
      processing: "Processing",
      cancel: "Cancel Process",
      title: "Upload Image",
      subtitle: "Drag & drop or click to browse",
      selectFile: "Select File",
      support: "Supports JPG, PNG"
    },
    export: {
      json: "Download JSON",
      csv: "Download CSV",
      weekRequired: "The Week Number field is required."
    },
    notes: {
      button: "Notes",
      title: "Notepad & History",
      currentTab: "Current Draft",
      historyTab: "Notes Archive",
      placeholder: "Write observations here. This note will be auto-saved on reset or export.",
      emptyHistory: "No archived notes yet.",
      date: "Date",
      content: "Content",
      actions: "Actions",
      save: "Save",
      delete: "Delete",
      deleteAll: "Delete All",
      edit: "Edit",
      source: "Source"
    },
    importJson: {
      button: "Open JSON",
      title: "JSON Files",
      subtitle: "Click to load into editor",
      empty: "No files loaded",
      load: "Load into Editor",
      remove: "Remove"
    }
  },
  es: {
    appTitle: "StudyGuide Builder",
    modeJson: "JSON Builder",
    modeCsv: "CSV Builder",
    tabs: {
      basics: "Básico",
      smart: "Smart Split",
      upload: "Imagen",
      csvEntry: "Nueva Fila",
      csvTable: "Tabla CSV"
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
      week: "Semana",
      day: "Día",
      ready: "LISTO",
      select: "Seleccionar...",
      days: ["Sábado", "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]
    },
    smart: {
      title: "Editor de Enfoque",
      subtitle: "Segmentación inteligente con cursor automático",
      divide: "Divide",
      reset: "¿Reiniciar editor?",
      workspace: "Espacio de Trabalho",
      classify: "Clasificar Bloque",
      content: "Contenido:",
      t: "Título",
      x: "Texto",
      q: "Pregunta",
      i: "Input",
      cancel: "Cancelar (ESC)",
      blockEditor: "Editor de Blocos",
      emptyState: "Usa el editor de la derecha para crear bloques automáticamente",
      addBlock: "Añadir Bloque Extra",
      updateTable: "Guardar Cambios",
      generateTable: "JSON Code",
      focusEdit: "Modo Enfoque",
      save: "Guardar Cambios",
      modalTitle: "Editar Bloco",
      editCode: "Editar el Código",
      saveCode: "Guardar Código",
      saveAndViewJson: "Guardar y Ver JSON",
      syncToBlocks: "Sincronizar con Bloques"
    },
    table: {
      preview: "Vista Previa de Tabla",
      rows: "Filas",
      clear: "Limpiar Todo",
      empty: "-- vacío --",
      confirmClear: "¿Deseas limpiar todos los datos actuales?",
      deleteColConfirm: "¿Deseas eliminar este item?",
      exportCsv: "Exportar CSV"
    },
    preview: {
      button: "Simular Lección",
      title: "Simulación de Experiencia de Usuario",
      subtitle: "Vea exactamente cómo se presentarán los bloques en la aplicación final.",
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
    notes: {
      button: "Notas",
      title: "Bloc de Notas & Archivo",
      currentTab: "Borrador Actual",
      historyTab: "Archivo de Notas",
      placeholder: "Escriba observaciones aquí. Esta nota se guardará automáticamente al reiniciar o exportar.",
      emptyHistory: "No hay notas archivadas todavía.",
      date: "Fecha",
      content: "Contenido",
      actions: "Acciones",
      save: "Guardar",
      delete: "Eliminar",
      deleteAll: "Eliminar Todo",
      edit: "Editar",
      source: "Origen"
    },
    importJson: {
      button: "Abrir JSON",
      title: "Archivos JSON",
      subtitle: "Haga clic para cargar en el editor",
      empty: "No hay archivos cargados",
      load: "Cargar en el Editor",
      remove: "Eliminar"
    }
  }
};
