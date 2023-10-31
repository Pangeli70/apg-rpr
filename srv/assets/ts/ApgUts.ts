/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

export class ApgUts {

    static Round(anum: number, aprecision: number) {

        const t = 10 ** (-1 * aprecision);
        const v = anum * t;
        const r = Math.round(v) / t;
        return r;

    }


    /**
     * If the condition is false alerts and throws an error
     * @param acondition condition that has to be true
     * @param aerrorMessage message to display
     */
    static Assert(acondition: boolean, aerrorMessage: string) {
        if (!acondition) {
            alert(aerrorMessage);
            throw new Error(aerrorMessage);
        }
    }

    /**
     * If the condition is true alerts and throws an error
     * @param acondition condition that has to be false
     * @param aerrorMessage message to display
     */
    static AssertNot(acondition: boolean, aerrorMessage: string) {
        this.Assert(!acondition, aerrorMessage)
    }



    static GetPropertyName<T extends object>(obj: T, selector: (x: Record<keyof T, keyof T>) => keyof T): keyof T {
        const keyRecord = Object.keys(obj).reduce((res, key) => {
            const typedKey = key as keyof T
            res[typedKey] = typedKey
            return res
        }, {} as Record<keyof T, keyof T>)
        return selector(keyRecord)
    }


}