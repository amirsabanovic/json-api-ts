// oxlint-disable-next-line typescript/triple-slash-reference
/// <reference path="./util.d.ts" />

declare namespace JsonApi {
    type PaginationLinks = "first" | "last" | "prev" | "next";

    type TopLevelLinks = "self" | "related" | "describedby" | PaginationLinks;

    /**
     * An object that represents a web link.
     */
    interface LinkObj {
        /**
         * A {@link Link | link} to a description document (e.g. OpenAPI or JSON Schema) for the link target.
         */
        describedby?: Link;

        /**
         * A string whose value is a URI-reference
         * {@link https://datatracker.ietf.org/doc/html/rfc3986#section-4.1 | [RFC3986 Section 4.1]} pointing to the
         * link’s target.
         */
        href: string;

        /**
         * A string or an array of strings indicating the language(s) of the link’s target. An array of strings
         * indicates that the link’s target is available in multiple languages.
         */
        hreflang?: string | string[];

        /**
         * A {@link MetaObj | meta object} containing non-standard meta-information about the link.
         */
        meta?: MetaObj;

        /**
         * A string indicating the link’s relation type.
         */
        rel?: string;

        /**
         * A string which serves as a label for the destination of a link such that it can be used as a human-readable
         * identifier (e.g., a menu entry).
         */
        title?: string;

        /**
         * A string indicating the media type of the link’s target.
         */
        type?: string;
    }

    /**
     * Either:
      - a string whose value is a URI-reference
      {@link https://datatracker.ietf.org/doc/html/rfc3986#section-4.1 | [RFC3986 Section 4.1]} pointing to the link’s
      target,
      - a {@link LinkObj | link object}, or
      - `null` if the link does not exist.
     */
    type Link = string | LinkObj | null;

    /**
     * A object used to represent links.
     */
    type LinksObj<K extends TopLevelLinks = TopLevelLinks> = {
        [P in K]?: Link;
    };

    /**
     * Contains information about the implementation of the JSON:API document.
     */
    interface JsonApiObj {
        /**
         * An array of URIs for all applied extensions.
         */
        ext?: string[];

        /**
         * A {@link MetaObj | meta object} that contains non-standard meta-information.
         */
        meta?: MetaObj;

        /**
         * An array of URIs for all applied profiles.
         */
        profile?: string[];

        /**
         * A string indicating the highest JSON:API version supported.
         */
        version?: string;
    }

    type MetaObj = {
        [x: string]: any;
    };

    interface ResourceIdentifier {
        id: string;
        type: string;
    }

    type RelationshipLinks = LinksObj<AtLeastOne<"self" | "related">>;

    type ToOneResourceLinkage = ResourceIdentifier | null;

    type ToManyResourceLinkage = ResourceIdentifier[];

    /**
     * Resource linkage in a compound document allows a client to link together all of the included resource objects
     * without having to GET any URLs via links.
     */
    type ResourceLinkage = ToOneResourceLinkage | ToManyResourceLinkage;

    type RelationshipObj = AtLeastOne<{
        data: ResourceLinkage;
        links: RelationshipLinks;
        meta: MetaObj;
    }>;

    type RelationshipsObj = Record<string, RelationshipObj>;

    type ResourceLinksObj = LinksObj<"self">;

    /**
     * An object whose members (“attributes”) represent information about the resource object in which it’s defined.
     *
     * A resource can not have an attribute and relationship with the same name, nor can it have an attribute or
     * relationship named `type` or `id`.
     */
    type AttributesObj<T = unknown> = Prohibit<T, "id" | "type">;

    /**
     * An object that represents a resource.
     *
     * @template {object} [D=unknown]
     * @extends {ResourceIdentifier}
     */
    interface ResourceObj<T = unknown> extends ResourceIdentifier {
        /**
         * An {@link AttributesObj | attributes object} representing some of the resource’s data.
         */
        attributes?: AttributesObj<T>;

        /**
         * A {@link LinksObj | links object} containing links related to the resource.
         */
        links?: ResourceLinksObj;

        /**
         * A {@link MetaObj | meta object} containing non-standard meta-information about a resource that can not be
         * represented as an attribute or relationship.
         */
        meta?: MetaObj;

        /**
         * A {@link RelationshipsObj | relationships object} describing relationships between the resource and other
         * JSON:API resources.
         */
        relationships?: RelationshipsObj;
    }

    /**
     * An object that originates at the client and represents a new resource to be created on the server.
     */
    export type NewResourceObj = Omit<ResourceObj, "id"> & {
        lid?: string;
    };

    type SingleResource<T extends unknown> = ResourceObj<T> | ResourceIdentifier | null;

    type ResourceCollection<T extends unknown> = ResourceObj<T>[] | ResourceIdentifier[];

    type Resource<T extends unknown> = SingleResource<T> | ResourceCollection<T>;

    type ErrorObj = AtLeastOne<{
        /**
         * An application-specific error code, expressed as a string value.
         */
        code?: string;

        /**
         * A human-readable explanation specific to this occurrence of the problem. Like {@link title | `title`}, this
         * field’s value can be localized.
         */
        detail?: string;

        /**
         * A unique identifier for this particular occurrence of the problem.
         */
        id?: string;

        /**
         * A {@link LinksObj | links object}.
         */
        links?: {
            /**
             * A {@link Link | link} that leads to further details about this particular occurrence of the problem.
             */
            about?: Link;

            /**
             * A {@link Link | link} that identifies the type of error that this particular error is an instance of.
             */
            type?: Link;
        };

        /**
         * A {@link MetaObj | meta object} containing non-standard meta-information about the error.
         */
        meta?: MetaObj;

        /**
         * An object containing references to the primary source of the error.
         */
        source?: AtLeastOne<{
            /**
             * A string indicating the name of a single request header which caused the error.
             */
            header: string;

            /**
             * A string indicating which URI query parameter caused the error.
             */
            parameter: string;

            /**
             * A JSON Pointer {@link https://datatracker.ietf.org/doc/html/rfc6901 | [RFC6901]} to the value in the
             * request document that caused the error [e.g. `/data` for a primary data object, or
             * `/data/attributes/title` for a specific attribute].
             */
            pointer: string;
        }>;

        /**
         * The HTTP status code applicable to this problem, expressed as a string value.
         */
        status?: string;

        /**
         * A short, human-readable summary of the problem.
         */
        title?: string;
    }>;

    /**
     * The top-level links object MAY contain the following members:
      - `self`: the link that generated the current response document.
      - `related`: a related resource link when the primary data represents a resource relationship.
      - `describedby`: a link to a description document (e.g. OpenAPI or JSON Schema) for the current document.
      - {@link PaginationLinks | pagination} links for the primary data.
     */
    type TopLevelLinksObj = Partial<LinksObj>;

    interface DocumentBase {
        /**
         * An object describing the server’s implementation.
         */
        jsonapi?: JsonApiObj;

        /**
         * A {@link LinksObj | links object} related to the document as a whole.
         */
        links?: TopLevelLinksObj;
    }

    interface MetaDocument {
        /**
         * A {@link MetaObj | meta object} that contains non-standard meta-information.
         */
        meta: MetaObj;
    }

    export interface DataDocument<T = unknown> extends DocumentBase {
        /**
         * The document’s “primary data”.
         */
        data: Resource<T>;

        /**
         * An array of {@link ResourceObj | resource objects} that are related to the primary data and/or each other
         * (“included resources”).
         */
        included?: ResourceObj[];
    }

    export interface ErrorDocument extends DocumentBase {
        /**
         * An array of {@link Error | error objects}.
         */
        errors: ErrorObj[];
    }
}
