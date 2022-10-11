import puppeteer from "puppeteer";

export class WebUIController {
    private _shadowRoot: puppeteer.ElementHandle<ShadowRoot>;
    private _generateBlock: boolean = false;
    private _processing = false;

    private constructor(shadowRoot: puppeteer.ElementHandle<ShadowRoot>) {
        this._shadowRoot = shadowRoot;
    }

    public static async create(): Promise<WebUIController> {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null
        });
        const page = (await browser.pages())[0];
        await page.goto("http://127.0.0.1:7860");

        const shadowRoot = await page.evaluateHandle(() => document.querySelector("body > gradio-app")?.shadowRoot ?? null);
        if (shadowRoot.jsonValue() === null) throw new Error("Failed to get shadowRoot");

        return new WebUIController(shadowRoot as puppeteer.ElementHandle<ShadowRoot>);
    }

    public async isGenerating(): Promise<boolean> {
        const element = await this._shadowRoot.$("#txt2img_interrupt") as puppeteer.ElementHandle<HTMLButtonElement>;
        if (element === null) return false;

        let displayProperty = await element.evaluate(element => element.style.display);
        if (displayProperty === "") displayProperty = "none";
        return displayProperty !== "none";
    }

    public async tryGenerate(promptText: string): Promise<boolean> {
        if (this._generateBlock) return false;
        this._generateBlock = true;

        promptText = promptText.indexOf("masterpiece") === -1
            ? "masterpiece, " + promptText
            : promptText;
        
        const negativePromptTexts = [
            "nsfw",
            "lowres",
            "bad anatomy",
            "bad hands",
            "text",
            "error",
            "missing fingers",
            "extra digit",
            "fewer digits",
            "cropped",
            "worst quality",
            "low quality",
            "normal quality",
            "jpeg artifacts",
            "signature",
            "watermark",
            "username",
            "blurry"
        ].join(", ");

        if (await this.isGenerating()) {
            this._generateBlock = false;
            return false;
        }

        const promptDiv = await this._shadowRoot.$("#txt2img_prompt");
        if (promptDiv === null) {
            this._generateBlock = false;
            return false;
        }
        await promptDiv.$eval("textarea", (element, value) => {
            element.value = value;
            element.dispatchEvent(new Event('input', {bubbles:true}));
        }, promptText);
        const negPromptDiv = await this._shadowRoot.$("#negative_prompt");
        if (negPromptDiv === null) {
            this._generateBlock = false;
            return false;
        }
        await negPromptDiv.$eval("textarea", (element, value) => {
            element.value = value;
            element.dispatchEvent(new Event('input', {bubbles:true}));
        }, negativePromptTexts);

        const generateButton = await this._shadowRoot.$("#txt2img_generate");
        if (generateButton) {
            await generateButton.click();
            this._processing = true;
            await new Promise(resolve => setTimeout(resolve, 1000));
            this._generateBlock = false;
            return true;
        }

        this._generateBlock = false;
        return false;
    }

    public async flushImages(): Promise<string[]|null> {
        if (!this._processing) return null;

        const gallery = await this._shadowRoot.$("#txt2img_gallery");
        if (gallery === null) return null;

        const images = await gallery.$$("img");
        if (images.length === 0) return null;

        const base64ImageUrls = await Promise.all(images.map(async image => {
            return await image.evaluate(image => image.src);
        }));

        this._processing = false;
        return base64ImageUrls;
    }
}
