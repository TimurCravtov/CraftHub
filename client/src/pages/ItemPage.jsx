import ProductCard from "../component/ProductCard.jsx";
import Header from "../component/Header.jsx";

export default function ItemPage() {
    const products = [
        {
            id: 1,
            productName: "Minimalist Table",
            sellerName: "Andrei's Shop",
            price: 20,
            imageUrl: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353",
        },
        {
            id: 2,
            productName: "Handmade Vase",
            sellerName: "Maria Handmade",
            price: 35,
            imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
        },
        {
            id: 3,
            productName: "Wooden Chair",
            sellerName: "Crafts by Ion",
            price: 50,
            imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div
                className="relative h-64 bg-cover bg-center"
                style={{ backgroundImage: 'url(/assets/modern-plant-store-with-pottery-and-plants-on-wood.jpg)' }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Items</h1>
                    <div className="flex items-center space-x-2 text-white/80">
                        <a href="/" className="hover:text-white">Home</a>
                        <span>&gt;</span>
                        <a href="/shops" className="hover:text-white">Shops</a>
                        <span>&gt;</span>
                        <span>Items</span>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            productName={product.productName}
                            sellerName={product.sellerName}
                            price={product.price}
                            imageUrl={product.imageUrl}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
