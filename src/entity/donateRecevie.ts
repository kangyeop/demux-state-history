import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum Decide {
    yes = "y",
    no = "n"
}

@Entity()
export class DonateRecevie {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("char", { length: 16 })
    UID: string;

    @Column("int")
    nCateSeq: number;

    @Column("varchar", { length: 255 })
    stitle: string;

    @Column("int")
    sContent: number;

    @Column("int")
    nHit: number;

    @Column()
    isShow: boolean;

    @Column()
    sImg01: boolean;

    @Column()
    sImg02: boolean;

    @Column()
    sImg03: boolean;

    @Column()
    nDonateTol: boolean;

    @Column()
    sDate: boolean;

    @Column()
    eDate: boolean;

    @Column()
    nStatus: boolean;

    @Column()
    sManager: boolean;

    @Column()
    regDate: boolean;

    @Column()
    editDate: boolean;

    @Column()
    isDel: boolean;
}
