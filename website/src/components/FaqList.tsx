type FaqItem = {
  q: string;
  a: string;
};

type FaqListProps = {
  items: FaqItem[];
  className?: string;
};

export function FaqList({ items, className = "" }: FaqListProps) {
  return (
    <div className={`faq-list ${className}`.trim()}>
      {items.map((item, index) => (
        <details key={item.q} className="faq-item group">
          <summary className="faq-item__summary">
            <span className="faq-item__index" aria-hidden>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="faq-item__question">{item.q}</span>
            <span className="faq-item__toggle" aria-hidden>
              <span className="faq-item__icon" />
            </span>
          </summary>
          <div className="faq-item__body">
            <p className="faq-item__answer">{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
