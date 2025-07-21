import PropTypes from 'prop-types';
import {useState} from 'react';
import {NavLink} from 'react-router-dom';

const HARD_CODED_MENU = [
    {
        id: 'inventory',
        label: 'Inventory',
        children: [
            {
                id: 'products',
                label: 'Products',
                children: [
                    {
                        id: 'registerProduct',
                        label: 'Register Product',
                        children: [{
                            id: 'registerForm',
                            label: 'Register',
                            route: '/products/register'
                        }]
                    },
                    {
                        id: 'productList',
                        label: 'Product List',
                        route: '/products/list'
                    }
                ]
            }
        ]
    },
    {
        id: 'orders',
        label: 'Orders',
        children: [
            {
                id: 'orderHistory',
                label: 'Order History',
                route: '/orders/history'
            }
        ]
    }
];

// Recursive menu rendering with direction
const MenuNode = ({node, depth = 0}) => {
    const [open, setOpen] = useState(false);

    const hasChildren = !!node.children;
    const dropdownDirection =
        depth === 0
            ? 'top-full right-1 rounded-md'
            : 'top-0 right-full rounded-lg';

    return (
        <div
            className="relative group"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {hasChildren ? (
                <>
                    <button
                        className={`flex items-center gap-1 px-3 py-2 font-medium transition bg-transparent rounded-md
                        ${open ? 'bg-gray-800 text-white shadow-md' : 'hover:bg-gray-800 text-gray-200'} 
                        ${depth > 0 ? 'w-full text-left' : ''}`}
                        tabIndex={0}
                    >
                        {node.label}
                        <span className="ml-2 text-xs opacity-60">
                            {depth === 0 ? '▼' : '▶'}
                        </span>
                    </button>
                    <div
                        className={`absolute min-w-[200px] bg-gray-900/90 backdrop-blur-md border border-gray-700 shadow-2xl
                        py-1 ${dropdownDirection} z-30 transition-all duration-150
                        ${open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}
                        `}
                    >
                        {node.children.map(child => (
                            <MenuNode key={child.id} node={child} depth={depth + 1}/>
                        ))}
                    </div>
                </>
            ) : (
                <NavLink
                    to={node.route}
                    className={({isActive}) =>
                        `block px-4 py-2 rounded-md transition
                        ${isActive ? 'bg-blue-700 text-white font-semibold' : 'text-gray-200 hover:bg-gray-700 hover:text-white'}`
                    }
                    tabIndex={0}
                >
                    {node.label}
                </NavLink>
            )}
        </div>
    );
};

MenuNode.propTypes = {
    node: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        route: PropTypes.string,
        children: PropTypes.arrayOf(PropTypes.object),
    }).isRequired,
    depth: PropTypes.number,
};

export const CustomMenuTree = () => (
    <div className="flex space-x-2 ml-2">
        {HARD_CODED_MENU.map(root => (
            <MenuNode key={root.id} node={root}/>
        ))}
    </div>
);

CustomMenuTree.propTypes = {};
