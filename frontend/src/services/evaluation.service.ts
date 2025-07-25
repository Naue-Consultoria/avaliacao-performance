import { api } from '../config/api';
import type {
  EvaluationCycle,
  EvaluationExtended,
  EvaluationCompetency,
  ConsensusMeeting,
  CycleDashboard,
  NineBoxData,
  SelfEvaluation,
  LeaderEvaluation,
  EvaluationSummary
} from '../types/evaluation.types';

export const evaluationService = {
  // ====================================
  // EVALUATION CYCLES
  // ====================================
  
  // Renomeie para corresponder ao que o hook espera
  async getAllCycles(): Promise<EvaluationCycle[]> {
    try {
      const response = await api.get('/evaluations/cycles');
      // A API retorna os dados diretamente, não em response.data.data
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar ciclos:', error);
      return [];
    }
  },

  async getCurrentCycle(): Promise<EvaluationCycle | null> {
    try {
      const response = await api.get('/evaluations/cycles/current');
      // A API retorna os dados diretamente
      return response.data || null;
    } catch (error) {
      console.error('Erro ao buscar ciclo atual:', error);
      return null;
    }
  },

  async createCycle(cycle: Partial<EvaluationCycle>): Promise<EvaluationCycle> {
    const response = await api.post('/evaluations/cycles', cycle);
    return response.data;
  },

  async openCycle(cycleId: string): Promise<void> {
    await api.put(`/evaluations/cycles/${cycleId}/open`, {});
  },

  async closeCycle(cycleId: string): Promise<void> {
    await api.put(`/evaluations/cycles/${cycleId}/close`, {});
  },

  // ====================================
  // DASHBOARD
  // ====================================
  async getCycleDashboard(cycleId: string): Promise<CycleDashboard[]> {
    try {
      const response = await api.get(`/evaluations/cycles/${cycleId}/dashboard`);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      return [];
    }
  },

  async getNineBoxData(cycleId: string): Promise<NineBoxData[]> {
    try {
      const response = await api.get(`/evaluations/cycles/${cycleId}/nine-box`);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar nine box:', error);
      return [];
    }
  },

  // ====================================
  // EVALUATIONS
  // ====================================
  async getEmployeeEvaluations(cycleId: string, employeeId: string): Promise<EvaluationExtended[]> {
    try {
      const response = await api.get(`/evaluations/employee/${employeeId}?cycleId=${cycleId}`);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      return [];
    }
  },

  async checkExistingEvaluation(
    cycleId: string,
    employeeId: string,
    type: 'self' | 'leader'
  ): Promise<boolean> {
    try {
      const response = await api.get(
        `/evaluations/check?cycleId=${cycleId}&employeeId=${employeeId}&type=${type}`
      );
      return response.data || false;
    } catch {
      return false;
    }
  },

  // ====================================
  // AUTOAVALIAÇÕES
  // ====================================
  
  async getSelfEvaluations(employeeId: string, cycleId?: string): Promise<SelfEvaluation[]> {
    try {
      const url = cycleId 
        ? `/evaluations/self-evaluations/${employeeId}?cycleId=${cycleId}`
        : `/evaluations/self-evaluations/${employeeId}`;
      const response = await api.get(url);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar autoavaliações:', error);
      return [];
    }
  },

  async saveSelfEvaluation(
    cycleId: string,
    employeeId: string,
    competencies: EvaluationCompetency[],
    toolkit?: {
      knowledge?: string[];
      tools?: string[];
      strengths_internal?: string[];
      qualities?: string[];
    }
  ): Promise<SelfEvaluation> {
    const response = await api.post('/evaluations/self', {
      cycleId,
      employeeId,
      competencies,
      toolkit
    });
    return response.data;
  },

  // ====================================
  // AVALIAÇÕES DE LÍDER
  // ====================================
  
  async getLeaderEvaluations(employeeId: string, cycleId?: string): Promise<LeaderEvaluation[]> {
    try {
      const url = cycleId 
        ? `/evaluations/leader-evaluations/${employeeId}?cycleId=${cycleId}`
        : `/evaluations/leader-evaluations/${employeeId}`;
      const response = await api.get(url);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar avaliações de líder:', error);
      return [];
    }
  },

  async saveLeaderEvaluation(
    cycleId: string,
    employeeId: string,
    evaluatorId: string,
    competencies: EvaluationCompetency[],
    potentialScore: number,
    feedback?: {
      strengths_internal?: string;
      improvements?: string;
      observations?: string;
    },
    pdi?: {
      goals: string[];
      actions: string[];
      resources?: string[];
      timeline?: string;
    }
  ): Promise<LeaderEvaluation> {
    const response = await api.post('/evaluations/leader', {
      cycleId,
      employeeId,
      evaluatorId,
      competencies,
      potentialScore,
      feedback,
      pdi
    });
    return response.data;
  },

  // ====================================
  // CONSENSUS
  // ====================================
  async createConsensusMeeting(
    meeting: Partial<ConsensusMeeting>
  ): Promise<ConsensusMeeting> {
    const response = await api.post('/evaluations/consensus', meeting);
    return response.data;
  },

  async completeConsensusMeeting(
    meetingId: string,
    performanceScore: number,
    potentialScore: number,
    notes: string
  ): Promise<void> {
    await api.put(`/evaluations/consensus/${meetingId}/complete`, {
      performanceScore,
      potentialScore,
      notes
    });
  },

  // ====================================
  // FUNÇÕES AUXILIARES
  // ====================================
  
  // Calcular score por categoria
  calculateCategoryScore(competencies: EvaluationCompetency[], category: string): number {
    const categoryComps = competencies.filter(c => c.category === category);
    if (categoryComps.length === 0) return 0;
    
    const sum = categoryComps.reduce((acc, comp) => acc + (comp.score || 0), 0);
    return Number((sum / categoryComps.length).toFixed(2));
  },

  // Calcular score final
  calculateFinalScore(competencies: EvaluationCompetency[]): number {
    if (competencies.length === 0) return 0;
    
    const sum = competencies.reduce((acc, comp) => acc + (comp.score || 0), 0);
    return Number((sum / competencies.length).toFixed(2));
  },

  // Mapear posição no Nine Box
  getNineBoxPosition(performance: number, potential: number): string {
    const perfLevel = performance <= 2 ? 'low' : performance <= 3 ? 'medium' : 'high';
    const potLevel = potential <= 2 ? 'low' : potential <= 3 ? 'medium' : 'high';
    
    const positions: { [key: string]: string } = {
      'low-low': 'Questionável',
      'low-medium': 'Novo/Desenvolvimento',
      'low-high': 'Enigma',
      'medium-low': 'Eficaz',
      'medium-medium': 'Mantenedor',
      'medium-high': 'Forte Performance',
      'high-low': 'Especialista',
      'high-medium': 'Alto Performance',
      'high-high': 'Estrela'
    };
    
    return positions[`${perfLevel}-${potLevel}`] || 'Não classificado';
  },

  // ====================================
  // PDI - PLANO DE DESENVOLVIMENTO INDIVIDUAL
  // ====================================
  
  async savePDI(pdiData: {
    employeeId: string;
    goals: string[];
    actions: string[];
    resources?: string[];
    timeline?: string;
    items?: any[]; // Adicionar suporte para items
  }): Promise<any> {
    try {
      const response = await api.post('/evaluations/pdi', pdiData);
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar PDI:', error);
      throw error;
    }
  },

  async getPDI(employeeId: string): Promise<any> {
    try {
      const response = await api.get(`/evaluations/pdi/${employeeId}`);
      // O backend retorna { success: true, data: pdi }
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar PDI:', error);
      return null;
    }
  },

  async updatePDI(pdiId: string, updates: {
    goals?: string[];
    actions?: string[];
    resources?: string[];
    timeline?: string;
  }): Promise<any> {
    try {
      const response = await api.put(`/evaluations/pdi/${pdiId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar PDI:', error);
      throw error;
    }
  }
};