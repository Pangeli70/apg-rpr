/** -----------------------------------------------------------------------
 * @module [apg-rpr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.8 [APG 2023/08/11]
 * -----------------------------------------------------------------------
*/

export interface ApgRpr_IMaterial {
    name: ApgRrp_eMaterial;
    density: number;
    friction: number;
    restitution: number;
    color: number;
    linearDamping?: number;
    angularDamping?: number;
}


export enum ApgRrp_eMaterial {
    Custom = "Custom",
    Sponge = "Sponge",
    Plastic = "Plastic",
    SoftRubber = "Soft rubber",
    HardRubber = "Hard rubber",
    SoftWood = "Soft wood",
    HardWood = "Hard wood",
    Ice = "Ice",
    Glass = "Glass",
    Aluminium = "Aluminium",
    Concrete = "Concrete",
    Stone = "Rock",
    Granite = "Granite",
    Steel = "Steel",
    InoxSteel = "Inox Steel",
    Copper = "Copper",
    Lead = "Lead",
    Gold = "Gold",
}


export type ApgRpr_TMaterialRecord = Record<ApgRrp_eMaterial, ApgRpr_IMaterial>;

export const ApgRrp_MaterialsTable: ApgRpr_TMaterialRecord = {

    [ApgRrp_eMaterial.Custom]: {
        name: ApgRrp_eMaterial.Custom,
        density: 1,
        friction: 0.5,
        restitution: 0.5,
        color: 0xfffff
    },

    [ApgRrp_eMaterial.Sponge]: {
        name: ApgRrp_eMaterial.Sponge,
        density: 0.1,
        friction: 1,
        restitution: 0.05,
        color: 0xfffff
    },

    [ApgRrp_eMaterial.Plastic]: {
        name: ApgRrp_eMaterial.Plastic,
        density: 0.65,
        friction: 0.5,
        restitution: 0.6,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.SoftRubber]: {
        name: ApgRrp_eMaterial.SoftRubber,
        density: 0.7,
        friction: 0.95,
        restitution: 0.7,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.HardRubber]: {
        name: ApgRrp_eMaterial.HardRubber,
        density: 0.75,
        friction: 0.9,
        restitution: 0.95,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.SoftWood]: {
        name: ApgRrp_eMaterial.SoftWood,
        density: 0.8,
        friction: 0.9,
        restitution: 0.2,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.HardWood]: {
        name: ApgRrp_eMaterial.HardWood,
        density: 0.85,
        friction: 0.8,
        restitution: 0.4,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.Ice]: {
        name: ApgRrp_eMaterial.Ice,
        density: 0.92,
        friction: 0.01,
        restitution: 0.3,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.Glass]: {
        name: ApgRrp_eMaterial.Glass,
        density: 2.3,
        friction: 0.15,
        restitution: 0.7,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.Aluminium]: {
        name: ApgRrp_eMaterial.Aluminium,
        density: 2.7,
        friction: 0.4,
        restitution: 0.4,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.Concrete]: {
        name: ApgRrp_eMaterial.Concrete,
        density: 3,
        friction: 0.6,
        restitution: 0.45,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.Stone]: {
        name: ApgRrp_eMaterial.Stone,
        density: 3.2,
        friction: 0.5,
        restitution: 0.5,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.Granite]: {
        name: ApgRrp_eMaterial.Granite,
        density: 3.5,
        friction: 0.3,
        restitution: 0.7,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.Steel]: {
        name: ApgRrp_eMaterial.Steel,
        density: 7.75,
        friction: 0.3,
        restitution: 0.5,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.InoxSteel]: {
        name: ApgRrp_eMaterial.InoxSteel,
        density: 8,
        friction: 0.15,
        restitution: 0.55,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.Copper]: {
        name: ApgRrp_eMaterial.Copper,
        density: 8.75,
        friction: 0.75,
        restitution: 0.3,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.Lead]: {
        name: ApgRrp_eMaterial.Lead,
        density: 11.3,
        friction: 0.85,
        restitution: 0.25,
        color: 0xfffff
    },
    [ApgRrp_eMaterial.Gold]: {
        name: ApgRrp_eMaterial.Gold,
        density: 19.3,
        friction: 0.45,
        restitution: 0.35,
        color: 0xfffff
    }

}