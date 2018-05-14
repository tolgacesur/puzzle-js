export enum EVENTS {
    GATEWAY_UPDATED = 'GATEWAY_UPDATED',
    GATEWAY_READY = 'GATEWAY_READY'
}

export enum FRAGMENT_RENDER_MODES {
    PREVIEW = 'preview',
    STREAM = 'stream'
}

export enum RESOURCE_INJECT_TYPE {
    INLINE,
    EXTERNAL
}

export enum RESOURCE_TYPE {
    CSS,
    JS
}

export enum RESOURCE_LOCATION {
    HEAD,
    BODY_START,
    BODY_END,
    CONTENT_START,
    CONTENT_END
}

export enum REPLACE_ITEM_TYPE {
    ASSET,
    CONTENT,
    PLACEHOLDER,
    CHUNKED_CONTENT
}

export enum HTTP_METHODS {
    GET = 'get',
    POST = 'post'
}

export const CONTENT_REPLACE_SCRIPT = `<script>function $p(p,c){var z = document.querySelector(c),r = z.innerHTML;z.parentNode.removeChild(z);document.querySelector(p).innerHTML=r}</script>`;
export const DEFAULT_MAIN_PARTIAL = `main`;