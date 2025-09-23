import { ErroGestor } from '../infra/erro-gestor.ts';
import type { VisaoLogin } from '../visao/visao-login.ts';
import { GestorAutenticacao } from '../gestor/gestor-autenticacao.ts';


export class ControladoraAutenticacao {

    private gestor = new GestorAutenticacao();
    private visao: VisaoLogin;

    constructor(visao: VisaoLogin) {
        this.visao = visao;
    }

    async login(login: string, senha: string): Promise<void> {
        try {
            await this.gestor.autenticar(login, senha);
            this.visao.redirecionarParaIndex();
        } catch (erro: any) {
            if (erro instanceof ErroGestor) {
                this.visao.exibirMensagem( erro.getProblemas() );
            } else {
                this.visao.exibirMensagem( [`Não foi possível completar o login: ${erro.message}`] ); 
            }
        }
    }

}