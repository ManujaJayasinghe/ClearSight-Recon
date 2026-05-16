import './BrandTitle.css'

/**
 * Animated Serpentine brand lockup (ClearSight / Recon).
 *
 * @param {{
 *   name: string,
 *   as?: 'h1' | 'h2' | 'span' | 'div',
 *   size?: 'sidebar' | 'hero',
 *   className?: string,
 * }} props
 */
export default function BrandTitle({
  name,
  as: Tag = 'span',
  size = 'sidebar',
  className = '',
}) {
  const dash = name.indexOf('-')
  const lead = dash >= 0 ? name.slice(0, dash) : name
  const tail = dash >= 0 ? name.slice(dash + 1) : ''

  return (
    <Tag
      className={`brand-title brand-title--${size}${className ? ` ${className}` : ''}`}
    >
      <span className="brand-title__glow" aria-hidden="true" />
      <span className="brand-title__inner">
        <span className="brand-title__line">{lead}</span>
        {tail ? (
          <span className="brand-title__line brand-title__line--recon">{tail}</span>
        ) : null}
      </span>
    </Tag>
  )
}
