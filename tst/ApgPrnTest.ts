import * as Prn from '../lib/mod.ts';

export class ApgPrnTest { 

    static async Run() { 
        await Prn.ApgPrnWorldSimulator.Run();
    }
}