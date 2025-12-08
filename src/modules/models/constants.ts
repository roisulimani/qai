/**
 * Model constants - Re-exported from registry for backward compatibility
 * 
 * @deprecated Use ModelRegistryService from './registry' for new code
 */
import { MODEL_IDS as REGISTRY_MODEL_IDS, DEFAULT_MODEL as REGISTRY_DEFAULT_MODEL, ModelId as RegistryModelId, MODEL_REGISTRY } from './registry';

export const MODEL_IDS = REGISTRY_MODEL_IDS;
export type ModelId = RegistryModelId;
export const DEFAULT_MODEL = REGISTRY_DEFAULT_MODEL;

/**
 * Legacy MODEL_OPTIONS for backward compatibility
 * 
 * @deprecated Use ModelRegistryService.getAvailableModels() instead
 */
export const MODEL_OPTIONS: Array<{
    value: ModelId;
    label: string;
    description: string;
}> = MODEL_REGISTRY.filter(model => model.enabled && !model.deprecated).map(model => ({
    value: model.modelId as ModelId,
    label: model.label,
    description: model.description,
}));
