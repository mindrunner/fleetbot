/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */

import BN from 'bn.js'
import bs58 from 'bs58'

export class Coordinates {
    private readonly _x: BN
    private readonly _y: BN

    public static fromString = (str: string): Coordinates => {
        const [x, y] = str.split(',')

        return new Coordinates(new BN(x, 10), new BN(y, 10))
    }

    public static fromBN = (x: BN, y: BN): Coordinates => new Coordinates(x, y)

    public static fromNumber = (x: number, y: number): Coordinates =>
        new Coordinates(x, y)

    private constructor(x: BN | number, y: BN | number) {
        this._x = typeof x === 'number' ? new BN(x, 10) : x
        this._y = typeof y === 'number' ? new BN(y, 10) : y
        // logger.debug('Coordinates', { x: this._x.toNumber(), y: this._y.toNumber() })
    }

    private static toB58 = (bn: BN): string =>
        bs58.encode(bn.toTwos(64).toArrayLike(Buffer, 'le', 8))

    get xBN(): BN {
        return this._x
    }

    get yBN(): BN {
        return this._y
    }

    get xB58(): string {
        return Coordinates.toB58(this._x)
    }

    get yB58(): string {
        return Coordinates.toB58(this._y)
    }

    get x(): number {
        return this._x.toNumber()
    }

    get y(): number {
        return this._y.toNumber()
    }

    public distanceFrom = (other: Coordinates): number => {
        const x = this._x.sub(other._x)
        const y = this._y.sub(other._y)

        return Math.sqrt(x.mul(x).add(y.mul(y)).toNumber())
    }

    public equals = (other: Coordinates): boolean =>
        this._x.eq(other._x) && this._y.eq(other._y)

    public toString = (): string =>
        `${this._x.toNumber()},${this._y.toNumber()}`

    public toArray = (): [BN, BN] => [this._x, this._y]
}

/* eslint-enable @typescript-eslint/naming-convention */
/* eslint-enable no-underscore-dangle */
