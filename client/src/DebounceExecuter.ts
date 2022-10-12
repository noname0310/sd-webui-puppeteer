export class DebounceExecuter {
    private readonly _delay: number;
    private _timer: number|null = null;

    public constructor(delay = 500) {
        this._delay = delay;
    }

    public execute(callback: () => void): void {
        if (this._timer !== null) {
            window.clearTimeout(this._timer);
            this._timer = null;
        }

        this._timer = window.setTimeout(() => {
            this._timer = null;
            callback();
        }, this._delay);
    }

    public get isExecuting(): boolean {
        return this._timer !== null;
    }
}
