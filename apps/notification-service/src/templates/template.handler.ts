import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Handlebars from 'handlebars';

import { TemplateType } from '../notification/enums/TemplateType.enum.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function renderTemplate(
    templateName: string,
    templateType: TemplateType,
    params: Record<string, string>,
): Promise<string> {
    const templatePath = path.join(
        __dirname,
        'apps',
        'notification-service',
        'src',
        'templates',
        'email',
        templateType,
        `${templateName}.hbs`,
    );

    const content = await fs.readFile(templatePath, 'utf-8');

    const template = Handlebars.compile(content);

    return template(params);
}