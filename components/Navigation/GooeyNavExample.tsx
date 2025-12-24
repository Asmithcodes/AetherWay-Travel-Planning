import GooeyNav from './GooeyNav';

/**
 * Example usage of the GooeyNav component
 * This demonstrates the gooey navigation effect with particle-based transitions
 */
const GooeyNavExample = () => {
    const items = [
        { label: "Home", href: "#" },
        { label: "About", href: "#" },
        { label: "Contact", href: "#" },
    ];

    return (
        <div style={{ height: '600px', position: 'relative' }}>
            <GooeyNav
                items={items}
                particleCount={15}
                particleDistances={[90, 10]}
                particleR={100}
                initialActiveIndex={0}
                animationTime={600}
                timeVariance={300}
                colors={[1, 2, 3, 1, 2, 3, 1, 4]}
            />
        </div>
    );
};

export default GooeyNavExample;
