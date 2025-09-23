export class ErroGestor extends Error {

    private problemas: string[] = [];

    constructor(message?: string) {
        super(message);
    }

    getProblemas(): string[] { return this.problemas; }

    static comProblemas( problemas: string[] ): ErroGestor {
        const erro = new ErroGestor();
        erro.problemas = problemas;
        return erro;
    }

}