export class ActionHandler {
    constructor(component) {
        this.component = component;
        this.actions = {
            'open_url': (url) => window.open(url, '_blank'),
            'close_article': (isExit) => {
                if (this.component && typeof this.component.onClose === 'function') {
                    this.component.onClose(isExit);
                }
            }
        };
    }

    execute(actionString) {
        if (typeof actionString !== 'string') {
            if (typeof actionString === 'function') {
                actionString();
            }
            return;
        }

        const match = actionString.match(/(\w+)\((.*)\)/);
        if (!match) {
            console.warn(`[ActionHandler] Invalid action string format: ${actionString}`);
            return;
        }

        const [, actionName, argsString] = match;
        const action = this.actions[actionName];

        if (action) {
            try {
                // This is a simplified parser. It handles simple arguments like booleans, numbers, and strings in quotes.
                const args = JSON.parse(`[${argsString}]`);
                action.apply(this, args);
            } catch (e) {
                console.error(`[ActionHandler] Error executing action "${actionName}" with args "${argsString}":`, e);
            }
        } else {
            console.warn(`[ActionHandler] No action found for "${actionName}"`);
        }
    }
}
