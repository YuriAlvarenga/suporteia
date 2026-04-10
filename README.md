# Support Large Accounts

Sistema avançado de gestão de métricas e suporte para contas de grande porte. Esta aplicação oferece dashboards em tempo real, análise de chamados indevidos e monitoramento de produtividade, integrando um frontend robusto em React com um backend escalável no Supabase.

## 🚀 Tecnologias

### Frontend
* **React 19**: Interface moderna e reativa.
* **Vite**: Ambiente de desenvolvimento ultra-rápido.
* **Material UI (MUI) v7**: Sistema de design e componentes de interface.
* **Recharts & MUI X-Charts**: Gráficos dinâmicos para visualização de dados.
* **Redux Toolkit**: Gerenciamento de estado global (Redux).
* **Redux Persist**: Mantém os dados da sessão mesmo após atualizar a página.
* **React Router Dom v7**: Navegação e roteamento dinâmico.

### Backend & Integração
* **Supabase**: Banco de dados PostgreSQL e Autenticação.
* **Axios**: Cliente HTTP para integrações externas.
* **JS-Cookie**: Gestão de cookies de segurança.
* **Date-fns**: Manipulação complexa de períodos e datas.

## 🛠️ Instalação e Uso

### 1. Clonar o repositório
git clone [https://github.com/seu-usuario/support-large-accounts.git](https://github.com/seu-usuario/support-large-accounts.git)
cd support-large-accounts


2. Instalar dependências
npm install

3. Configurar Variáveis de Ambiente

Crie um arquivo .env na raiz do projeto e adicione suas credenciais do Supabase:
Snippet de código

VITE_SUPABASE_URL=seu_projeto_supabase_url
VITE_SUPABASE_ANON_KEY=sua_chave_anon_publica

4. Executar o projeto
npm run dev

📊 Funcionalidades Implementadas

    Dashboard de Métricas: Visualização de total de chamados, média diária e taxa de erros.

    Ranking Dinâmico: Visualização das lojas/grupos com maior volume de tickets (com exclusão inteligente do filtro atual).

    Filtros Avançados: Seleção por período (7 a 90 dias), grupo de empresas e responsável.

    Análise de Tags: Progresso visual das classificações (tags) mais utilizadas no suporte.

    Persistência de Dados: O estado do dashboard é preservado entre sessões.

    Gerenciamento de chamados baseado em tickets abertos no whatsapp

📂 Organização do Projeto

    src/components: Componentes reutilizáveis de interface e gráficos.

    src/redux/slice: Configuração do Redux, Slices, Store e Persist.

    src/services: Lógica customizada para consumo de dados do Supabase.
