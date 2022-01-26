export interface Position {
    x: number
    y: number
}

export interface Velocity {
    x: number
    y: number
}

export interface Circle {
    position: Position;
    velocity: Velocity;
    radius: number;
    color: string;
    opacity?: number;
    fade?: boolean;
}

export interface Rectangle {
    position: Position;
    velocity: Velocity;
    height?: number;
    width?: number;
    image?: HTMLImageElement;
}