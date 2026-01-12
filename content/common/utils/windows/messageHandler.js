/**
 * Sets up a listener for 'deep-link' messages from a parent window.
 * When a message is received, the provided callback function is executed with the slug.
 * @param {function(string): void} callback - The function to call with the deep-link slug.
 */
export function handleDeepLink(callback) {
    window.addEventListener('message', (event) => {
        // IMPORTANT: In a production environment, you should always validate the origin
        // for security reasons. Example: if (event.origin !== 'https://your-trusted-domain.com') return;

        if (event.data && event.data.type === 'deep-link' && typeof callback === 'function') {
            console.log('Deep-link message received with slug:', event.data.slug);
            callback(event.data.slug);
        }
    });
}

/**
 * Sets up a listener for 'requestAudioFade' messages from a parent window.
 * When a message is received, the provided callback function is executed.
 * @param {function(): void} callback - The function to call when an audio fade is requested.
 */
export function handleAudioFade(callback) {
    window.addEventListener('message', (event) => {
        // IMPORTANT: Add origin validation in production.
        if (event.data && event.data.type === 'requestAudioFade' && typeof callback === 'function') {
            console.log('Audio fade request received.');
            callback();
        }
    });
}
