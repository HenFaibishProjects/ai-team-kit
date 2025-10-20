import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplateService {
  /**
   * Render a Handlebars template with provided data
   * @param template - The Handlebars template string
   * @param data - The data object to populate the template
   * @returns The rendered template string
   */
  render(template: string, data: Record<string, any>): string {
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(data);
  }

  /**
   * Register a Handlebars helper
   * @param name - The name of the helper
   * @param fn - The helper function
   */
  registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
    Handlebars.registerHelper(name, fn);
  }

  /**
   * Register a Handlebars partial
   * @param name - The name of the partial
   * @param partial - The partial template string
   */
  registerPartial(name: string, partial: string): void {
    Handlebars.registerPartial(name, partial);
  }
}
