import { env } from "@/config/env";
import { FilterType } from "@/types/enums";
import type { Culture } from "@/types/enums";
import type { Filter, SearchParams, SearchResults } from "@/types/filter";
import {
    type Allergen,
    type Ingredient,
    type Nutrient,
    type Product,
    SearchResultProductSchema,
    type SearchResultProduct,
} from "@/types/product";
import { apiFetch } from "./base";

const BASE_URL = env.api.foodbook;

type BackendFilterType = "Checkbox" | "Slider" | "Select";

interface BackendFilterOption {
    id: string | number;
    name: string;
    count?: number;
}

interface BackendFilter {
    id: string;
    name: string;
    key: string;
    filterType: BackendFilterType;
    showInitially: boolean;
    options?: BackendFilterOption[];
}

interface BackendSearchProduct {
    id: number;
    name: string;
    image?: string;
    brand?: string;
    gtin?: string;
    artikelnummer?: string;
}

interface BackendSearchFilterItem {
    key: string;
    id: number;
    results: number;
}

interface BackendVoedingswaarde {
    id: number;
    name: string;
    minValue: number;
    maxValue: number;
}

interface BackendSearchResults {
    results: number;
    products: BackendSearchProduct[];
    filters: BackendSearchFilterItem[];
    showSubFilters: unknown[];
    voedingswaardes: BackendVoedingswaarde[] | BackendFilter[];
}

function mapSearchResultToProduct(searchResult: SearchResultProduct): Product {
    const source = searchResult.product;

    const ingredientInfos =
        source.specificationinfolist?.specificationinfo.ingredientset
            ?.ingredients?.ingredientinfo ?? [];
    const ingredients: Ingredient[] = ingredientInfos.map((ing) => {
        const order = ing.sequence
            ? Number.parseInt(ing.sequence, 10)
            : undefined;

        return {
            name: ing.name,
            percentage: undefined,
            order: Number.isNaN(order) ? undefined : order,
        };
    });

    const allergenInfos =
        source.specificationinfolist?.specificationinfo.allergenset?.allergens
            .allergeninfo ?? [];
    const allergens: Allergen[] = allergenInfos.map((allergen) => ({
        name: {
            value: allergen.name.value,
            translation: allergen.translation,
        },
        levelcode: allergen.levelofcontainmentid ?? "",
        allergentype: undefined,
    }));

    const nutrientInfos =
        source.specificationinfolist?.specificationinfo.nutrientset
            ?.nutrientinfolist.nutrientinfo ?? [];
    const nutrients: Nutrient[] = nutrientInfos
        .filter(
            (nutrient) =>
                nutrient.name &&
                (nutrient.decimalvalue || typeof nutrient.value === "number") &&
                nutrient.unitofmeasurename?.value,
        )
        .map((nutrient) => ({
            name: nutrient.name!,
            value:
                nutrient.decimalvalue ??
                (typeof nutrient.value === "number"
                    ? nutrient.value.toString()
                    : ""),
            unit: nutrient.unitofmeasurename?.value ?? "",
            quantitytypecode: undefined,
        }));

    const specificationinfolist =
        ingredients.length || allergens.length || nutrients.length
            ? {
                  specificationinfo: {
                      ingredientset: ingredients.length
                          ? { ingredient: ingredients }
                          : undefined,
                      allergenset: allergens.length
                          ? { allergen: allergens }
                          : undefined,
                      nutrientset: nutrients.length
                          ? { nutrient: nutrients }
                          : undefined,
                  },
              }
            : undefined;

    const logisticinfolist = source.logisticinfolist
        ? {
              logisticinfo: {
                  assetinfolist:
                      source.logisticinfolist.logisticinfo.assetinfolist,
              },
          }
        : undefined;

    return {
        product: {
            mongoDbId: source.mongoDbId,
            hasImpactScore: source.hasImpactScore,
            summary: {
                id: source.summary.id,
                mongoDbId: source.summary.mongoDbId,
                name: source.summary.name,
                ean: source.summary.ean,
                brandname: source.summary.brandname,
                brandid: source.summary.brandid,
                packshot: source.summary.packshot,
                publiclyvisible: source.summary.publiclyvisible,
                lastupdatedon: new Date(
                    source.summary.lastupdatedon as unknown as string,
                ),
            },
            productinfolist: source.productinfolist,
            specificationinfolist,
            logisticinfolist,
        },
    };
}

export function parseProductFromSearchResult(data: unknown): Product | null {
    const parsed = SearchResultProductSchema.safeParse(data);
    if (!parsed.success) {
        console.error("SearchResult product validation failed:", parsed.error);
        return null;
    }

    return mapSearchResultToProduct(parsed.data);
}

function mapFilterType(type: BackendFilterType): FilterType {
    switch (type) {
        case "Checkbox":
            return FilterType.CHECKBOX;
        case "Slider":
            return FilterType.RANGE;
        case "Select":
            return FilterType.SELECT;
        default:
            return FilterType.CHECKBOX;
    }
}

function mapBackendFilters(backendFilters: BackendFilter[]): Filter[] {
    return backendFilters.map((filter) => ({
        id: filter.id,
        key: filter.key,
        label: filter.name,
        type: mapFilterType(filter.filterType),
        options: filter.options?.map((option) => ({
            id: option.id,
            label: option.name,
            count: option.count,
        })),
    }));
}

export const productService = {
    async getById(id: string, token?: string): Promise<Product | null> {
        const url = `${BASE_URL}/v2/Product/GetProductSheet/${id}`;
        const result = await apiFetch<unknown>(url, { token });

        if (!result.success) {
            return null;
        }

        return parseProductFromSearchResult(result.data);
    },

    async getByEan(gtin: string): Promise<Product | null> {
        const url = `${BASE_URL}/v2/Product/GetProductByEAN/${gtin}`;
        const result = await apiFetch<unknown>(url);

        if (!result.success) {
            return null;
        }

        return parseProductFromSearchResult(result.data);
    },

    async search(params: SearchParams): Promise<SearchResults | null> {
        // Converteer filters naar de juiste structuur voor de API
        const filters: Array<{ key: string; values: number[] }> = [];

        if (params.filters) {
            for (const [key, value] of Object.entries(params.filters)) {
                // Converteer filter key naar juiste formaat (brand -> Brand)
                const apiKey = key === "brand" ? "Brand" : key;

                // Converteer filter values naar number array
                let values: number[] = [];

                if (Array.isArray(value)) {
                    values = value
                        .map((v) => {
                            const num =
                                typeof v === "string"
                                    ? Number.parseInt(v, 10)
                                    : Number(v);
                            return Number.isNaN(num) ? 0 : num;
                        })
                        .filter((v) => v !== 0);
                } else if (value !== undefined && value !== null) {
                    const num =
                        typeof value === "string"
                            ? Number.parseInt(value, 10)
                            : Number(value);
                    if (!Number.isNaN(num) && num !== 0) {
                        values = [num];
                    }
                }

                if (values.length > 0) {
                    filters.push({ key: apiKey, values });
                }
            }
        }

        const payload = {
            keyword: params.keyword ?? "",
            Filters: filters,
            pageIndex: params.page ?? 0,
            pageSize: params.pageSize ?? 21,
        };

        // Als er een securityToken is, zoeken we binnen een digitale catalogus
        const isCatalogSearch = Boolean(params.securityToken);

        const url = isCatalogSearch
            ? `${BASE_URL}/v2/Search/DC/SearchResults?language=nl`
            : `${BASE_URL}/v2/Search/SearchResults`;

        const result = await apiFetch<BackendSearchResults>(url, {
            method: "POST",
            headers: isCatalogSearch
                ? {
                      securitytoken: params.securityToken as string,
                  }
                : undefined,
            body: JSON.stringify(payload),
        });

        if (!result.success) {
            return null;
        }

        const backend = result.data;

        const page = params.page ?? 0;
        const pageSize = params.pageSize ?? 21;
        const total = backend.results;
        const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

        // Backend.filters is een platte array met { key, id, results }
        // We moeten deze groeperen per key en converteren naar Filter structuur
        const filterMap = new Map<string, Filter>();

        // Verwerk backend.filters (platte array met { key, id, results })
        if (backend.filters && Array.isArray(backend.filters)) {
            for (const item of backend.filters) {
                if (!item.key) continue;

                let filter = filterMap.get(item.key);
                if (!filter) {
                    // Maak nieuwe filter aan
                    filter = {
                        key: item.key,
                        label: item.key, // Label wordt later uit initialFilters gehaald
                        type: FilterType.CHECKBOX, // Default type
                        options: [],
                    };
                    filterMap.set(item.key, filter);
                }

                // Voeg option toe met count (results wordt count)
                if (filter.options) {
                    filter.options.push({
                        id: item.id,
                        label: String(item.id), // Label wordt later uit initialFilters gehaald
                        count: item.results,
                    });
                }
            }
        }

        // Verwerk backend.voedingswaardes
        if (backend.voedingswaardes && Array.isArray(backend.voedingswaardes)) {
            // Check of het de nieuwe structuur is (met minValue/maxValue)
            const firstItem = backend.voedingswaardes[0];
            const isNewStructure =
                firstItem && "minValue" in firstItem && "maxValue" in firstItem;

            if (isNewStructure) {
                // Nieuwe structuur: { id, name, minValue, maxValue }
                for (const voedingswaarde of backend.voedingswaardes as BackendVoedingswaarde[]) {
                    // Gebruik name als key (of id als fallback)
                    const key =
                        voedingswaarde.name || String(voedingswaarde.id);

                    const filter: Filter = {
                        id: String(voedingswaarde.id),
                        key,
                        label: voedingswaarde.name,
                        type: FilterType.RANGE,
                        min: voedingswaarde.minValue,
                        max: voedingswaarde.maxValue,
                    };

                    filterMap.set(key, filter);
                }
            } else {
                // Oude structuur: BackendFilter[]
                const voedingswaardesFilters = (
                    backend.voedingswaardes as BackendFilter[]
                ).filter((filter) => filter.showInitially === true);
                const mappedVoedingswaardes = mapBackendFilters(
                    voedingswaardesFilters,
                );

                // Merge voedingswaardes filters met bestaande filters
                for (const filter of mappedVoedingswaardes) {
                    if (filter.key) {
                        const existingFilter = filterMap.get(filter.key);
                        if (
                            existingFilter &&
                            filter.options &&
                            existingFilter.options
                        ) {
                            // Merge options, behoud counts uit SearchResult
                            const existingOptionIds = new Set(
                                existingFilter.options.map((opt) => opt.id),
                            );
                            for (const option of filter.options) {
                                if (
                                    !existingOptionIds.has(option.id) &&
                                    existingFilter.options
                                ) {
                                    existingFilter.options.push(option);
                                } else if (existingFilter.options) {
                                    // Update count als die beschikbaar is
                                    const existingOption =
                                        existingFilter.options.find(
                                            (opt) => opt.id === option.id,
                                        );
                                    if (
                                        existingOption &&
                                        option.count !== undefined
                                    ) {
                                        existingOption.count = option.count;
                                    }
                                }
                            }
                        } else {
                            filterMap.set(filter.key, filter);
                        }
                    }
                }
            }
        }

        const searchResultFilters = Array.from(filterMap.values());

        return {
            products: backend.products,
            pagination: {
                page,
                pageSize,
                total,
                totalPages,
            },
            filters: searchResultFilters,
        };
    },

    async autocomplete(
        keyword: string,
        locale: Culture,
        securityToken?: string,
    ): Promise<string[]> {
        const isCatalogSearch = Boolean(securityToken);

        const url = isCatalogSearch
            ? `${BASE_URL}/v2/Search/DC/${locale}/AutoComplete/${encodeURIComponent(keyword)}`
            : `${BASE_URL}/v2/Search/${locale}/AutoComplete/${encodeURIComponent(keyword)}`;

        const result = await apiFetch<string[]>(url, {
            headers: isCatalogSearch
                ? {
                      securitytoken: securityToken as string,
                  }
                : undefined,
        });

        return result.success ? result.data : [];
    },

    async getFilters(): Promise<Filter[]> {
        const url = `${BASE_URL}/v2/Filter/List`;
        const result = await apiFetch<BackendFilter[]>(url);

        if (!result.success) {
            return [];
        }

        return mapBackendFilters(result.data);
    },

    async getImpactScore(
        mongoId: string,
        type: "farm" | "gate",
    ): Promise<unknown | null> {
        const endpoint = type === "farm" ? "Farmtofarm" : "Cradletogate";
        const url = `${BASE_URL}/v2/Co/${endpoint}/${mongoId}`;
        const result = await apiFetch<unknown>(url);

        return result.success ? result.data : null;
    },
};