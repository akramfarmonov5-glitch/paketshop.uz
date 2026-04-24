import { useEffect } from 'react';
import { Product, BlogPost, Category } from '../types';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  product?: Product;
  blogPost?: BlogPost;
  category?: Category;
  breadcrumbs?: { name: string; url: string }[];
  noindex?: boolean;
}

const BASE_URL = 'https://paketshop.uz';

/**
 * SEOHead — Dinamik meta taglar va structured data boshqarish
 * Har bir sahifa uchun unique title, description, OG tags, JSON-LD
 */
const SEOHead: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  product,
  blogPost,
  category,
  breadcrumbs,
  noindex = false,
}) => {
  useEffect(() => {
    // === Title ===
    const fullTitle = title
      ? `${title} | PaketShop.uz`
      : "PaketShop.uz | Online Do'kon - O'zbekistondagi Sifatli Mahsulotlar";
    document.title = fullTitle;

    // === Meta Tags ===
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const desc = description || "PaketShop.uz - O'zbekistondagi ishonchli onlayn do'kon. Soatlar, sumkalar, parfyumeriya va boshqa sifatli mahsulotlar.";
    setMeta('description', desc);

    if (keywords && keywords.length > 0) {
      setMeta('keywords', keywords.join(', '));
    }

    if (noindex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      setMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1');
    }

    // === Canonical ===
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonical || `${BASE_URL}/`);

    // === Open Graph ===
    setMeta('og:title', title || "PaketShop.uz | Sifatli Mahsulotlar Onlayn Do'koni", true);
    setMeta('og:description', desc, true);
    setMeta('og:url', canonical || `${BASE_URL}/`, true);
    setMeta('og:type', ogType === 'product' ? 'product' : ogType === 'article' ? 'article' : 'website', true);
    setMeta('og:image', ogImage || `${BASE_URL}/logo-light.png`, true);
    setMeta('og:site_name', 'PaketShop.uz', true);
    setMeta('og:locale', 'uz_UZ', true);

    // === FB Product Catalog Microdata ===
    if (product) {
      setMeta('product:price:amount', product.price.toString(), true);
      setMeta('product:price:currency', 'UZS', true);
      setMeta('product:brand', 'PaketShop', true);
      setMeta('product:availability', (!product.stock || product.stock > 0) ? 'in stock' : 'out of stock', true);
      setMeta('product:condition', 'new', true);
      setMeta('product:retailer_item_id', product.id.toString(), true);
    }

    // === Twitter Card ===
    setMeta('twitter:card', 'summary_large_image', true);
    setMeta('twitter:title', title || "PaketShop.uz | Online Do'kon", true);
    setMeta('twitter:description', desc, true);
    setMeta('twitter:image', ogImage || `${BASE_URL}/logo-light.png`, true);

    // === JSON-LD Structured Data ===
    // Clean up previous dynamic schemas
    document.querySelectorAll('script[data-seo-dynamic]').forEach(el => el.remove());

    const addJsonLd = (data: object) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-dynamic', 'true');
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    };

    // Product Schema
    if (product) {
      addJsonLd({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": [product.image, ...(product.images || [])],
        "description": product.shortDescription,
        "sku": `PSHOP-${product.id}`,
        "brand": {
          "@type": "Brand",
          "name": "PaketShop"
        },
        "category": product.category,
        "offers": {
          "@type": "Offer",
          "url": canonical || `${BASE_URL}/`,
          "priceCurrency": "UZS",
          "price": product.price,
          "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          "availability": (product.stock === undefined || product.stock > 0)
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "PaketShop.uz"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "127",
          "bestRating": "5"
        }
      });
    }

    // BlogPosting Schema
    if (blogPost) {
      addJsonLd({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": blogPost.title,
        "image": blogPost.image,
        "datePublished": blogPost.date,
        "dateModified": blogPost.date,
        "author": {
          "@type": "Organization",
          "name": "PaketShop.uz"
        },
        "publisher": {
          "@type": "Organization",
          "name": "PaketShop.uz",
          "logo": {
            "@type": "ImageObject",
            "url": `${BASE_URL}/logo-light.png`
          }
        },
        "description": blogPost.seo?.description || blogPost.content.substring(0, 160),
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonical || `${BASE_URL}/`
        }
      });
    }

    // BreadcrumbList Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      addJsonLd({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        }))
      });
    }

    // Category / ItemList Schema
    if (category) {
      addJsonLd({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${category.name} - PaketShop.uz`,
        "description": category.description || `${category.name} kategoriyasi - PaketShop.uz`,
        "url": canonical || `${BASE_URL}/`,
        "image": category.image
      });
    }

    // Cleanup on unmount
    return () => {
      document.querySelectorAll('script[data-seo-dynamic]').forEach(el => el.remove());
    };
  }, [title, description, keywords, canonical, ogImage, ogType, product, blogPost, category, breadcrumbs, noindex]);

  return null; // This component renders nothing visually
};

export default SEOHead;
