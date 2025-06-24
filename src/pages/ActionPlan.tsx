import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvaluation } from '../context/EvaluationContext';
import Button from '../components/Button';
import { 
  ArrowLeft,
  Save,
  Plus,
  X,
  Target,
  Calendar,
  FileText,
  User,
  Lightbulb,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  Briefcase,
  AlertCircle,
  Sparkles,
  Rocket,
  Users,
  ChevronDown,
  ChevronUp,
  ListChecks,
  MessageSquare,
  Download,
  FileSpreadsheet,
  StickyNote,
  FileDown
} from 'lucide-react';

interface ActionItem {
  id: string;
  competencia: string;
  calendarizacao: string;
  comoDesenvolver: string;
  resultadosEsperados: string;
  status: '1' | '2' | '3' | '4' | '5';
  observacao: string;
}

interface ActionPlanData {
  colaborador: string;
  cargo: string;
  departamento: string;
  periodo: string;
  curtosPrazos: ActionItem[];
  mediosPrazos: ActionItem[];
  longosPrazos: ActionItem[];
}

const ActionPlan = () => {
  const navigate = useNavigate();
  const { employees } = useEvaluation();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['curtosPrazos']));
  const [planData, setPlanData] = useState<ActionPlanData>({
    colaborador: '',
    cargo: '',
    departamento: '',
    periodo: '',
    curtosPrazos: [],
    mediosPrazos: [],
    longosPrazos: []
  });

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  useEffect(() => {
    if (selectedEmployee) {
      setPlanData(prev => ({
        ...prev,
        colaborador: selectedEmployee.name,
        cargo: selectedEmployee.position,
        departamento: selectedEmployee.department,
        periodo: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
      }));
    }
  }, [selectedEmployee]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const createNewActionItem = (): ActionItem => ({
    id: Date.now().toString(),
    competencia: '',
    calendarizacao: '',
    comoDesenvolver: '',
    resultadosEsperados: '',
    status: '1',
    observacao: ''
  });

  const addActionItem = (category: 'curtosPrazos' | 'mediosPrazos' | 'longosPrazos') => {
    setPlanData(prev => ({
      ...prev,
      [category]: [...prev[category], createNewActionItem()]
    }));
  };

  const removeActionItem = (category: 'curtosPrazos' | 'mediosPrazos' | 'longosPrazos', id: string) => {
    setPlanData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }));
  };

  const updateActionItem = (
    category: 'curtosPrazos' | 'mediosPrazos' | 'longosPrazos',
    id: string,
    field: keyof ActionItem,
    value: any
  ) => {
    setPlanData(prev => ({
      ...prev,
      [category]: prev[category].map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSave = () => {
    if (!selectedEmployeeId) {
      toast.error('Selecione um colaborador');
      return;
    }

    const totalItems = planData.curtosPrazos.length + planData.mediosPrazos.length + planData.longosPrazos.length;
    if (totalItems === 0) {
      toast.error('Adicione pelo menos um item de desenvolvimento');
      return;
    }

    toast.success('Plano de Desenvolvimento salvo com sucesso!');
    navigate('/reports');
  };

  const exportToPDF = () => {
    if (!selectedEmployeeId || (planData.curtosPrazos.length + planData.mediosPrazos.length + planData.longosPrazos.length) === 0) {
      toast.error('Adicione itens ao PDI antes de exportar');
      return;
    }

    // Criar conteúdo HTML para o PDF
    const pdfContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e6076; }
            h2 { color: #12b0a0; margin-top: 30px; }
            h3 { color: #333; margin-top: 20px; }
            .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .item { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #12b0a0; }
            .field { margin: 10px 0; }
            .label { font-weight: bold; color: #555; }
            .status { display: inline-block; padding: 3px 10px; border-radius: 15px; font-size: 12px; }
            .status-1 { background: #f3f4f6; color: #374151; }
            .status-2 { background: #dbeafe; color: #1e40af; }
            .status-3 { background: #fef3c7; color: #92400e; }
            .status-4 { background: #fed7aa; color: #c2410c; }
            .status-5 { background: #d1fae5; color: #065f46; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Plano de Desenvolvimento Individual - ${planData.colaborador}</h1>
            <p><strong>Cargo:</strong> ${planData.cargo}</p>
            <p><strong>Departamento:</strong> ${planData.departamento}</p>
            <p><strong>Período:</strong> ${planData.periodo}</p>
          </div>
          
          ${planData.curtosPrazos.length > 0 ? `
            <h2>📚 Curto Prazo (0-6 meses)</h2>
            ${planData.curtosPrazos.map((item, index) => `
              <div class="item">
                <h3>${index + 1}. ${item.competencia || 'Competência não definida'}</h3>
                <div class="field"><span class="label">Calendarização:</span> ${item.calendarizacao || 'A definir'}</div>
                <div class="field"><span class="label">Como desenvolver:</span> ${item.comoDesenvolver || 'A definir'}</div>
                <div class="field"><span class="label">Resultados Esperados:</span> ${item.resultadosEsperados || 'A definir'}</div>
                <div class="field">
                  <span class="label">Status:</span> 
                  <span class="status status-${item.status}">${statusOptions.find(s => s.value === item.status)?.label || 'Não iniciado'}</span>
                </div>
                ${item.observacao ? `<div class="field"><span class="label">Observações:</span> ${item.observacao}</div>` : ''}
              </div>
            `).join('')}
          ` : ''}
          
          ${planData.mediosPrazos.length > 0 ? `
            <h2>🎯 Médio Prazo (6-12 meses)</h2>
            ${planData.mediosPrazos.map((item, index) => `
              <div class="item">
                <h3>${index + 1}. ${item.competencia || 'Competência não definida'}</h3>
                <div class="field"><span class="label">Calendarização:</span> ${item.calendarizacao || 'A definir'}</div>
                <div class="field"><span class="label">Como desenvolver:</span> ${item.comoDesenvolver || 'A definir'}</div>
                <div class="field"><span class="label">Resultados Esperados:</span> ${item.resultadosEsperados || 'A definir'}</div>
                <div class="field">
                  <span class="label">Status:</span> 
                  <span class="status status-${item.status}">${statusOptions.find(s => s.value === item.status)?.label || 'Não iniciado'}</span>
                </div>
                ${item.observacao ? `<div class="field"><span class="label">Observações:</span> ${item.observacao}</div>` : ''}
              </div>
            `).join('')}
          ` : ''}
          
          ${planData.longosPrazos.length > 0 ? `
            <h2>🚀 Longo Prazo (12-24 meses)</h2>
            ${planData.longosPrazos.map((item, index) => `
              <div class="item">
                <h3>${index + 1}. ${item.competencia || 'Competência não definida'}</h3>
                <div class="field"><span class="label">Calendarização:</span> ${item.calendarizacao || 'A definir'}</div>
                <div class="field"><span class="label">Como desenvolver:</span> ${item.comoDesenvolver || 'A definir'}</div>
                <div class="field"><span class="label">Resultados Esperados:</span> ${item.resultadosEsperados || 'A definir'}</div>
                <div class="field">
                  <span class="label">Status:</span> 
                  <span class="status status-${item.status}">${statusOptions.find(s => s.value === item.status)?.label || 'Não iniciado'}</span>
                </div>
                ${item.observacao ? `<div class="field"><span class="label">Observações:</span> ${item.observacao}</div>` : ''}
              </div>
            `).join('')}
          ` : ''}
        </body>
      </html>
    `;

    // Criar blob e download
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        window.URL.revokeObjectURL(url);
      };
    }
    
    toast.success('PDI preparado para impressão/PDF!');
  };

  const exportToExcel = () => {
    if (!selectedEmployeeId || (planData.curtosPrazos.length + planData.mediosPrazos.length + planData.longosPrazos.length) === 0) {
      toast.error('Adicione itens ao PDI antes de exportar');
      return;
    }

    // Preparar dados para CSV
    const csvHeaders = ['Prazo', 'Competência', 'Calendarização', 'Como Desenvolver', 'Resultados Esperados', 'Status', 'Observações'];
    const csvRows = [];

    // Adicionar informações do colaborador
    csvRows.push(['PDI - ' + planData.colaborador]);
    csvRows.push(['Cargo: ' + planData.cargo]);
    csvRows.push(['Departamento: ' + planData.departamento]);
    csvRows.push(['Período: ' + planData.periodo]);
    csvRows.push([]); // linha vazia
    csvRows.push(csvHeaders);

    // Adicionar dados de curto prazo
    planData.curtosPrazos.forEach(item => {
      csvRows.push([
        'Curto Prazo (0-6 meses)',
        item.competencia || 'A definir',
        item.calendarizacao || 'A definir',
        item.comoDesenvolver || 'A definir',
        item.resultadosEsperados || 'A definir',
        statusOptions.find(s => s.value === item.status)?.label || 'Não iniciado',
        item.observacao || ''
      ]);
    });

    // Adicionar dados de médio prazo
    planData.mediosPrazos.forEach(item => {
      csvRows.push([
        'Médio Prazo (6-12 meses)',
        item.competencia || 'A definir',
        item.calendarizacao || 'A definir',
        item.comoDesenvolver || 'A definir',
        item.resultadosEsperados || 'A definir',
        statusOptions.find(s => s.value === item.status)?.label || 'Não iniciado',
        item.observacao || ''
      ]);
    });

    // Adicionar dados de longo prazo
    planData.longosPrazos.forEach(item => {
      csvRows.push([
        'Longo Prazo (12-24 meses)',
        item.competencia || 'A definir',
        item.calendarizacao || 'A definir',
        item.comoDesenvolver || 'A definir',
        item.resultadosEsperados || 'A definir',
        statusOptions.find(s => s.value === item.status)?.label || 'Não iniciado',
        item.observacao || ''
      ]);
    });

    // Converter para CSV
    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Criar link de download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `PDI_${planData.colaborador.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('PDI exportado para Excel com sucesso!');
  };

  const exportToNotion = () => {
    if (!selectedEmployeeId || (planData.curtosPrazos.length + planData.mediosPrazos.length + planData.longosPrazos.length) === 0) {
      toast.error('Adicione itens ao PDI antes de exportar');
      return;
    }

    const notionFormat = generateNotionFormat();
    
    // Copia o formato Notion para a área de transferência
    navigator.clipboard.writeText(notionFormat).then(() => {
      toast.success('PDI copiado! Cole no Notion usando Ctrl+V (ou Cmd+V)');
      
      // Mostrar instruções adicionais
      toast((t) => (
        <div>
          <p className="font-medium mb-2">Instruções para colar no Notion:</p>
          <ol className="text-sm space-y-1">
            <li>1. Abra o Notion</li>
            <li>2. Crie uma nova página ou abra uma existente</li>
            <li>3. Cole o conteúdo (Ctrl+V ou Cmd+V)</li>
            <li>4. O Notion formatará automaticamente!</li>
          </ol>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Fechar
          </button>
        </div>
      ), {
        duration: 10000,
        position: 'top-center',
      });
    }).catch(() => {
      toast.error('Erro ao copiar para a área de transferência');
    });
  };

  const generateNotionFormat = () => {
    let notionText = `# PDI - ${planData.colaborador}\n\n`;
    notionText += `**Cargo:** ${planData.cargo}\n`;
    notionText += `**Departamento:** ${planData.departamento}\n`;
    notionText += `**Período:** ${planData.periodo}\n\n`;

    const formatCategory = (title: string, items: ActionItem[]) => {
      let text = `## ${title}\n\n`;
      items.forEach((item, index) => {
        text += `### ${index + 1}. ${item.competencia}\n`;
        text += `**Calendarização:** ${item.calendarizacao || 'A definir'}\n`;
        text += `**Como desenvolver:** ${item.comoDesenvolver || 'A definir'}\n`;
        text += `**Resultados Esperados:** ${item.resultadosEsperados || 'A definir'}\n`;
        text += `**Status:** ${statusOptions.find(s => s.value === item.status)?.label || 'Não iniciado'}\n`;
        if (item.observacao) {
          text += `**Observações:** ${item.observacao}\n`;
        }
        text += '\n';
      });
      return text;
    };

    if (planData.curtosPrazos.length > 0) {
      notionText += formatCategory('📚 Curto Prazo (0-6 meses)', planData.curtosPrazos);
    }
    if (planData.mediosPrazos.length > 0) {
      notionText += formatCategory('🎯 Médio Prazo (6-12 meses)', planData.mediosPrazos);
    }
    if (planData.longosPrazos.length > 0) {
      notionText += formatCategory('🚀 Longo Prazo (12-24 meses)', planData.longosPrazos);
    }

    return notionText;
  };

  const categories = [
    {
      key: 'curtosPrazos' as const,
      title: 'Curto Prazo',
      subtitle: '0-6 meses',
      icon: BookOpen,
      gradient: 'from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700',
      bgColor: 'bg-primary-50 dark:bg-primary-900/20',
      borderColor: 'border-primary-200 dark:border-primary-700',
      iconBg: 'bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700',
      description: 'Ações imediatas e de rápido impacto'
    },
    {
      key: 'mediosPrazos' as const,
      title: 'Médio Prazo',
      subtitle: '6-12 meses',
      icon: Target,
      gradient: 'from-secondary-500 to-secondary-600 dark:from-secondary-600 dark:to-secondary-700',
      bgColor: 'bg-secondary-50 dark:bg-secondary-900/20',
      borderColor: 'border-secondary-200 dark:border-secondary-700',
      iconBg: 'bg-gradient-to-br from-secondary-500 to-secondary-600 dark:from-secondary-600 dark:to-secondary-700',
      description: 'Desenvolvimento contínuo e estruturado'
    },
    {
      key: 'longosPrazos' as const,
      title: 'Longo Prazo',
      subtitle: '12-24 meses',
      icon: Rocket,
      gradient: 'from-accent-500 to-accent-600 dark:from-accent-600 dark:to-accent-700',
      bgColor: 'bg-accent-50 dark:bg-accent-900/20',
      borderColor: 'border-accent-200 dark:border-accent-700',
      iconBg: 'bg-gradient-to-br from-accent-500 to-accent-600 dark:from-accent-600 dark:to-accent-700',
      description: 'Visão estratégica e crescimento sustentável'
    }
  ];

  const statusOptions = [
    { value: '1', label: 'Não iniciado', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600' },
    { value: '2', label: 'Iniciado', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' },
    { value: '3', label: 'Em andamento', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700' },
    { value: '4', label: 'Quase concluído', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700' },
    { value: '5', label: 'Concluído', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700' }
  ];

  const getProgress = () => {
    const allItems = [...planData.curtosPrazos, ...planData.mediosPrazos, ...planData.longosPrazos];
    if (allItems.length === 0) return 0;
    
    const completedItems = allItems.filter(item => item.status === '5').length;
    return (completedItems / allItems.length) * 100;
  };

  const renderActionItems = (category: 'curtosPrazos' | 'mediosPrazos' | 'longosPrazos') => {
    const categoryData = categories.find(cat => cat.key === category)!;
    const items = planData[category];
    const isExpanded = expandedSections.has(category);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <button
          onClick={() => toggleSection(category)}
          className={`w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ${categoryData.bgColor} border-b ${categoryData.borderColor} hover:opacity-90 transition-all duration-200`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${categoryData.iconBg} shadow-md`}>
                <categoryData.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-100">{categoryData.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 hidden sm:block">{categoryData.subtitle} • {categoryData.description}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 sm:hidden">{categoryData.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100">{items.length}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">itens</p>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 sm:p-6 lg:p-8"
            >
              <div className="space-y-4 sm:space-y-6">
                {items.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm sm:text-base">Nenhum item de desenvolvimento adicionado</p>
                    <Button
                      variant="outline"
                      onClick={() => addActionItem(category)}
                      icon={<Plus size={16} />}
                      size="sm"
                    >
                      Adicionar Primeiro Item
                    </Button>
                  </div>
                ) : (
                  <>
                    {items.map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIndex * 0.1 }}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-200 dark:border-gray-600"
                      >
                        {/* Header do Item */}
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${categoryData.iconBg} flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-md`}>
                              {itemIndex + 1}
                            </div>
                            <div>
                              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Item de Desenvolvimento
                              </h4>
                              <span className={`inline-flex mt-1 px-2 py-1 rounded-full text-xs font-medium border ${statusOptions.find(s => s.value === item.status)?.color}`}>
                                {statusOptions.find(s => s.value === item.status)?.label}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeActionItem(category, item.id)}
                            className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                          >
                            <X size={16} className="sm:hidden" />
                            <X size={20} className="hidden sm:block" />
                          </button>
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                          {/* Competência a desenvolver */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                              <Award className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                              Competência a desenvolver
                            </label>
                            <input
                              type="text"
                              className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 text-gray-700 dark:text-gray-300 transition-all duration-200 text-sm sm:text-base"
                              placeholder="Ex: Liderança, Comunicação, Gestão de Projetos..."
                              value={item.competencia}
                              onChange={(e) => updateActionItem(category, item.id, 'competencia', e.target.value)}
                            />
                          </div>

                          {/* Calendarização */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-secondary-600 dark:text-secondary-400" />
                              Calendarização
                            </label>
                            <input
                              type="month"
                              className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-secondary-500 dark:focus:border-secondary-400 focus:ring-secondary-500 dark:focus:ring-secondary-400 text-gray-700 dark:text-gray-300 transition-all duration-200 text-sm sm:text-base"
                              value={item.calendarizacao}
                              onChange={(e) => updateActionItem(category, item.id, 'calendarizacao', e.target.value)}
                            />
                          </div>

                          {/* Como desenvolver as competências */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                              <Lightbulb className="h-4 w-4 mr-2 text-accent-600 dark:text-accent-400" />
                              Como desenvolver as competências
                            </label>
                            <textarea
                              className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-accent-500 dark:focus:border-accent-400 focus:ring-accent-500 dark:focus:ring-accent-400 text-gray-700 dark:text-gray-300 transition-all duration-200 text-sm sm:text-base"
                              rows={3}
                              placeholder="Descreva as ações e métodos para desenvolver esta competência..."
                              value={item.comoDesenvolver}
                              onChange={(e) => updateActionItem(category, item.id, 'comoDesenvolver', e.target.value)}
                            />
                          </div>

                          {/* Resultados Esperados */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                              <Target className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                              Resultados Esperados
                            </label>
                            <textarea
                              className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 text-gray-700 dark:text-gray-300 transition-all duration-200 text-sm sm:text-base"
                              rows={3}
                              placeholder="Descreva os resultados esperados com o desenvolvimento desta competência..."
                              value={item.resultadosEsperados}
                              onChange={(e) => updateActionItem(category, item.id, 'resultadosEsperados', e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-600">
                            {/* Status */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                Status
                              </label>
                              <select
                                className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500 dark:focus:ring-green-400 text-gray-700 dark:text-gray-300 transition-all duration-200 text-sm sm:text-base"
                                value={item.status}
                                onChange={(e) => updateActionItem(category, item.id, 'status', e.target.value as any)}
                              >
                                {statusOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Observação */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                <MessageSquare className="h-4 w-4 mr-2 text-secondary-600 dark:text-secondary-400" />
                                Observação
                              </label>
                              <textarea
                                className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-secondary-500 dark:focus:border-secondary-400 focus:ring-secondary-500 dark:focus:ring-secondary-400 text-gray-700 dark:text-gray-300 transition-all duration-200 text-sm sm:text-base"
                                rows={2}
                                placeholder="Observações adicionais..."
                                value={item.observacao}
                                onChange={(e) => updateActionItem(category, item.id, 'observacao', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => addActionItem(category)}
                        icon={<Plus size={16} />}
                        className="border-2 border-dashed hover:border-solid"
                        size="sm"
                      >
                        Adicionar Novo Item
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const progress = getProgress();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-0">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center flex-wrap">
                <FileText className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-accent-500 dark:text-accent-400 mr-2 sm:mr-3" />
                <span className="break-words">Plano de Desenvolvimento Individual</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">Estruture o crescimento e desenvolvimento do colaborador</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center sm:justify-end space-x-3">
            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Progresso Geral</p>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{Math.round(progress)}%</p>
            </div>
            <div className="relative">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#e5e7eb" strokeWidth="3" fill="none" className="sm:hidden dark:stroke-gray-700" />
                <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" className="hidden sm:block dark:stroke-gray-700" />
                <circle
                  cx="24" cy="24" r="20"
                  stroke="url(#progressGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${progress * 1.26} 126`}
                  strokeLinecap="round"
                  className="sm:hidden"
                />
                <circle
                  cx="32" cy="32" r="28"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${progress * 1.76} 176`}
                  strokeLinecap="round"
                  className="hidden sm:block"
                />
                <defs>
                  <linearGradient id="progressGradient">
                    <stop offset="0%" stopColor="#12b0a0" />
                    <stop offset="50%" stopColor="#1e6076" />
                    <stop offset="100%" stopColor="#baa673" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Seleção do colaborador */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Colaborador
            </label>
            <select
              className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 text-gray-700 dark:text-gray-300 transition-all duration-200 text-sm sm:text-base"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            >
              <option value="">Selecione um colaborador</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          {selectedEmployee && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Briefcase className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                  Cargo
                </label>
                <div className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-3 sm:px-4 py-2 sm:py-2.5 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  {planData.cargo}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                  Departamento
                </label>
                <div className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-3 sm:px-4 py-2 sm:py-2.5 text-gray-700 dark:text-gray-300 text-sm sm:text-base break-words">
                  {planData.departamento}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                  Período
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400 text-gray-700 dark:text-gray-300 transition-all duration-200 text-sm sm:text-base"
                  value={planData.periodo}
                  onChange={(e) => setPlanData(prev => ({ ...prev, periodo: e.target.value }))}
                  placeholder="Ex: 2024-2025"
                />
              </div>
            </>
          )}
        </div>
      </motion.div>      

      {/* Itens de Desenvolvimento */}
      {selectedEmployeeId && (
        <div className="space-y-4 sm:space-y-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              {renderActionItems(category.key)}
            </motion.div>
          ))}

          {/* Botões de Ação */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0"
          >
            <div className="flex items-center space-x-2 text-sm order-2 sm:order-1">
              {planData.curtosPrazos.length + planData.mediosPrazos.length + planData.longosPrazos.length === 0 ? (
                <>
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Adicione pelo menos um item de desenvolvimento
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    PDI pronto para ser salvo!
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 order-1 sm:order-2">
              <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2 sm:space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/reports')}
                  size="md"
                  className="w-full xs:w-auto"
                >
                  Cancelar
                </Button>
                
                {/* Botões de Exportação */}
                {planData.curtosPrazos.length + planData.mediosPrazos.length + planData.longosPrazos.length > 0 && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={exportToPDF}
                      icon={<FileDown size={16} />}
                      size="sm"
                      className="border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex-1 xs:flex-none"
                    >
                      <span className="hidden xs:inline">PDF</span>
                      <span className="xs:hidden">PDF</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={exportToExcel}
                      icon={<FileSpreadsheet size={16} />}
                      size="sm"
                      className="border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 flex-1 xs:flex-none"
                    >
                      <span className="hidden xs:inline">Excel</span>
                      <span className="xs:hidden">Excel</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={exportToNotion}
                      icon={<StickyNote size={16} />}
                      size="sm"
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex-1 xs:flex-none"
                    >
                      <span className="hidden sm:inline">Notion</span>
                      <span className="sm:hidden">Notion</span>
                    </Button>
                  </div>
                )}
              </div>
              
              <Button
                variant="primary"
                onClick={handleSave}
                icon={<Save size={18} />}
                size="md"
                disabled={planData.curtosPrazos.length + planData.mediosPrazos.length + planData.longosPrazos.length === 0}
                className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 hover:from-primary-600 hover:to-primary-700 dark:hover:from-primary-700 dark:hover:to-primary-800 w-full sm:w-auto"
              >
                Salvar PDI
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {!selectedEmployeeId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-700 p-8 sm:p-12 lg:p-16 text-center"
        >
          <div className="max-w-md mx-auto">
            <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 mb-4 sm:mb-6">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum colaborador selecionado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              Selecione um colaborador acima para criar seu Plano de Desenvolvimento Individual
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ActionPlan;