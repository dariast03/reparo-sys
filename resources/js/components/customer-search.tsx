import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Customer {
    id: number;
    name: string;
    document: string;
    phone: string;
    email: string;
}

interface CustomerSearchProps {
    onSelect: (customer: Customer) => void;
    placeholder?: string;
    initialValue?: string;
    disabled?: boolean;
}

export default function CustomerSearch({
    onSelect,
    placeholder = 'Buscar cliente por nombre, documento, teléfono...',
    initialValue = '',
    disabled = false,
}: CustomerSearchProps) {
    const [query, setQuery] = useState(initialValue);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const searchCustomers = async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setCustomers([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/admin/api/customers/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Error searching customers:', error);
            setCustomers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (value: string) => {
        setQuery(value);
        setSelectedIndex(-1);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            searchCustomers(value);
        }, 300);
    };

    const handleSelectCustomer = (customer: Customer) => {
        setQuery(customer.name);
        setCustomers([]);
        setIsOpen(false);
        onSelect(customer);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || customers.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < customers.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < customers.length) {
                    handleSelectCustomer(customers[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    const clearSearch = () => {
        setQuery('');
        setCustomers([]);
        setIsOpen(false);
        setSelectedIndex(-1);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (customers.length > 0) {
            setIsOpen(true);
        }
    }, [customers]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div ref={searchRef} className="relative w-full">
            <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (customers.length > 0) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="pr-10 pl-10"
                />
                {query && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {isOpen && (isLoading || customers.length > 0) && (
                <Card className="absolute z-50 mt-1 max-h-80 w-full overflow-auto">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-4 text-center text-muted-foreground">Buscando...</div>
                        ) : customers.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">No se encontraron clientes</div>
                        ) : (
                            <div className="max-h-80 overflow-auto">
                                {customers.map((customer, index) => (
                                    <div
                                        key={customer.id}
                                        onClick={() => handleSelectCustomer(customer)}
                                        className={`cursor-pointer border-b p-3 last:border-b-0 hover:bg-muted/50 ${
                                            index === selectedIndex ? 'bg-muted' : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{customer.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Badge variant="outline" className="text-xs">
                                                        {customer.document}
                                                    </Badge>
                                                    <span>{customer.phone}</span>
                                                </div>
                                                {customer.email && <p className="text-xs text-muted-foreground">{customer.email}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
