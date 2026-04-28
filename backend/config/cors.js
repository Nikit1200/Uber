const defaultAllowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

const defaultAllowedOriginPatterns = [
    /^https:\/\/[a-z0-9-]+-5173\.[a-z0-9-]+\.devtunnels\.ms$/i
];

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toOriginPattern(origin) {
    if (!origin.includes('*')) {
        return null;
    }

    const escapedOrigin = escapeRegex(origin).replace(/\\\*/g, '.*');
    return new RegExp(`^${escapedOrigin}$`, 'i');
}

function getAllowedOrigins() {
    const configuredOrigins = process.env.CORS_ORIGIN || process.env.FRONTEND_URL;

    if (!configuredOrigins) {
        return {
            exactOrigins: defaultAllowedOrigins,
            originPatterns: defaultAllowedOriginPatterns
        };
    }

    const exactOrigins = [];
    const originPatterns = [];

    configuredOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
        .forEach((origin) => {
            const pattern = toOriginPattern(origin);

            if (pattern) {
                originPatterns.push(pattern);
                return;
            }

            exactOrigins.push(origin);
        });

    return {
        exactOrigins,
        originPatterns
    };
}

function isOriginAllowed(origin, allowedOrigins) {
    if (!origin) {
        return true;
    }

    return (
        allowedOrigins.exactOrigins.includes(origin) ||
        allowedOrigins.originPatterns.some((pattern) => pattern.test(origin))
    );
}

function createCorsOptions() {
    const allowedOrigins = getAllowedOrigins();

    return {
        origin(origin, callback) {
            if (isOriginAllowed(origin, allowedOrigins)) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
    };
}

module.exports = {
    createCorsOptions
};
