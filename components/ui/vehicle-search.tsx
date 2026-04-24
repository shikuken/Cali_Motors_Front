'use client'

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { Search, Filter, Car, X, Gauge, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface Filters {
  marca: string
  minYear: string
  maxYear: string
  minPrice: string
  maxPrice: string
  estado: string
}

interface VehicleSearchProps {
  allVehicles: any[]
  onSearchChange: (searchTerm: string, filters: Filters) => void
}

export function VehicleSearch({ allVehicles = [], onSearchChange }: VehicleSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    marca: "",
    minYear: "",
    maxYear: "",
    minPrice: "",
    maxPrice: "",
    estado: "",
  })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Notify parent whenever search term or filters change
  useEffect(() => {
    onSearchChange(searchTerm, filters)
  }, [searchTerm, filters, onSearchChange])

  // Get unique brands from all vehicles
  const uniqueBrands = useMemo(() => {
    const brands = [...new Set(allVehicles.map(v => v.marca))].filter(Boolean)
    return brands.sort()
  }, [allVehicles])

  // Get year range from all vehicles
  const yearRange = useMemo(() => {
    if (allVehicles.length === 0) return { min: 2000, max: new Date().getFullYear() }
    const years = allVehicles.map(v => v.año).filter(Boolean)
    return {
      min: Math.min(...years),
      max: Math.max(...years),
    }
  }, [allVehicles])

  // Generate year options
  const yearOptions = useMemo(() => {
    const years = []
    for (let y = yearRange.max; y >= yearRange.min; y--) {
      years.push(y)
    }
    return years
  }, [yearRange])

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(v => v !== "")

  // Filter ALL vehicles from database based on search term and filters
  const filteredVehicles = useMemo(() => {
    return allVehicles.filter(vehicle => {
      // Text search
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = searchTerm === "" || 
        vehicle.marca?.toLowerCase().includes(searchLower) ||
        vehicle.modelo?.toLowerCase().includes(searchLower) ||
        String(vehicle.año).includes(searchLower) ||
        vehicle.descripcion?.toLowerCase().includes(searchLower)

      // Brand filter
      const matchesBrand = filters.marca === "" || vehicle.marca === filters.marca

      // Year filter
      const matchesMinYear = filters.minYear === "" || vehicle.año >= parseInt(filters.minYear)
      const matchesMaxYear = filters.maxYear === "" || vehicle.año <= parseInt(filters.maxYear)

      // Price filter
      const matchesMinPrice = filters.minPrice === "" || vehicle.precio >= parseInt(filters.minPrice)
      const matchesMaxPrice = filters.maxPrice === "" || vehicle.precio <= parseInt(filters.maxPrice)

      // Status filter
      const matchesEstado = filters.estado === "" || vehicle.estado === filters.estado

      return matchesSearch && matchesBrand && matchesMinYear && matchesMaxYear && 
             matchesMinPrice && matchesMaxPrice && matchesEstado
    })
  }, [allVehicles, searchTerm, filters])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle input focus
  const handleFocus = () => {
    if (searchTerm.length > 0 || hasActiveFilters) {
      setIsOpen(true)
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setIsOpen(true)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
    setIsOpen(false)
    inputRef.current?.focus()
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({
      marca: "",
      minYear: "",
      maxYear: "",
      minPrice: "",
      maxPrice: "",
      estado: "",
    })
  }

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(v => v !== "").length

  return (
    <div ref={searchRef} className="relative w-full lg:max-w-xl z-50">
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por marca, modelo, año..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters Button */}
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-11 rounded-xl px-3 relative"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-slate-900 text-white"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Filtros</h4>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Marca</label>
                <Select
                  value={filters.marca}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, marca: value === "all" ? "" : value }))}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Todas las marcas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las marcas</SelectItem>
                    {uniqueBrands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Range */}
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Año</label>
                <div className="flex gap-2">
                  <Select
                    value={filters.minYear}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, minYear: value === "all" ? "" : value }))}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="Desde" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Desde</SelectItem>
                      {yearOptions.map(year => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.maxYear}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, maxYear: value === "all" ? "" : value }))}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="Hasta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Hasta</SelectItem>
                      {yearOptions.map(year => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Precio (COP)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm text-slate-600">Estado</label>
                <Select
                  value={filters.estado}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, estado: value === "all" ? "" : value }))}
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Vendido">Vendido</SelectItem>
                    <SelectItem value="Pausado">Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full h-9 rounded-lg"
                onClick={() => {
                  setFiltersOpen(false)
                  setIsOpen(true)
                }}
              >
                Aplicar filtros
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (searchTerm.length > 0 || hasActiveFilters) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl max-h-[28rem] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 origin-top">
          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2 bg-slate-50/50">
              {filters.marca && (
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-white border-slate-200">
                  <span className="text-slate-500 mr-1">Marca:</span> {filters.marca}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, marca: "" }))}
                    className="ml-2 hover:text-slate-900 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(filters.minYear || filters.maxYear) && (
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-white border-slate-200">
                  <span className="text-slate-500 mr-1">Año:</span> {filters.minYear || "..."} - {filters.maxYear || "..."}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, minYear: "", maxYear: "" }))}
                    className="ml-2 hover:text-slate-900 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-white border-slate-200">
                  <span className="text-slate-500 mr-1">Precio:</span> ${filters.minPrice || "0"} - ${filters.maxPrice || "..."}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, minPrice: "", maxPrice: "" }))}
                    className="ml-2 hover:text-slate-900 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.estado && (
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-white border-slate-200">
                  <span className="text-slate-500 mr-1">Estado:</span> {filters.estado}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, estado: "" }))}
                    className="ml-2 hover:text-slate-900 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Results Header */}
          <div className="px-5 py-3 border-b border-slate-100 bg-white sticky top-0 z-10 flex justify-between items-center shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {filteredVehicles.length} {filteredVehicles.length === 1 ? "resultado" : "resultados"} encontrados
            </p>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto flex-1 p-2">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.slice(0, 10).map((vehicle) => (
                <Link
                  key={vehicle.id}
                  href={`/vehicles/${vehicle.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 px-3 py-3 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200 group"
                >
                  {/* Vehicle Image/Icon */}
                  <div className="w-16 h-16 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 group-hover:border-slate-300 transition-colors">
                    {vehicle.imagen ? (
                      <img
                        src={vehicle.imagen}
                        alt={`${vehicle.marca} ${vehicle.modelo}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Vehicle Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {vehicle.marca} <span className="font-normal">{vehicle.modelo}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-slate-50 text-slate-600">
                        {vehicle.año}
                      </Badge>
                      {vehicle.first_name && (
                        <span className="text-[11px] text-slate-500 truncate">
                          • {vehicle.first_name} {vehicle.last_name?.charAt(0)}.
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-semibold text-blue-600">
                        ${Number(vehicle.precio).toLocaleString("es-CO")}
                      </span>
                      {vehicle.kilometraje > 0 && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Gauge className="h-3 w-3" />
                          {Number(vehicle.kilometraje).toLocaleString("es-CO")} km
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        vehicle.estado === "Activo"
                          ? "bg-emerald-100 text-emerald-800"
                          : vehicle.estado === "Vendido"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {vehicle.estado}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-900 font-semibold">No se encontraron vehículos</p>
                <p className="text-sm text-slate-500 mt-1 max-w-[250px] leading-relaxed">Ajusta los filtros o intenta con términos diferentes para ver más resultados.</p>
              </div>
            )}
          </div>

          {/* View All Results */}
          {filteredVehicles.length > 10 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm sticky bottom-0">
              <button 
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 w-full text-center transition-colors flex items-center justify-center gap-1"
                onClick={() => setIsOpen(false)}
              >
                Ver los {filteredVehicles.length} resultados en el tablero <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
