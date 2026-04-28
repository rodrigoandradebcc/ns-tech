import axios from 'axios';

const HTTP_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida.',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Conflito de dados. Verifique as informações.',
  422: 'Dados inválidos. Verifique os campos.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
};

export function getErrorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const serverMsg = error.response.data?.message;
      if (typeof serverMsg === 'string') return serverMsg;
      const msg = HTTP_MESSAGES[error.response.status];
      if (msg) return msg;
    }
    if (error.request) return 'Sem conexão com o servidor.';
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
