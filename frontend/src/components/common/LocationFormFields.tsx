import type { Control, FieldValues, Path } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface LocationFormFieldsProps<T extends FieldValues> {
  control: Control<T>
  addressName?: Path<T>
  latitudeName?: Path<T>
  longitudeName?: Path<T>
  addressLabel?: string
}

export function LocationFormFields<T extends FieldValues>({
  control,
  addressName = "address" as Path<T>,
  latitudeName = "latitude" as Path<T>,
  longitudeName = "longitude" as Path<T>,
  addressLabel = "Address",
}: LocationFormFieldsProps<T>) {
  return (
    <>
      <FormField
        control={control}
        name={addressName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{addressLabel}</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Street, city, state, country"
                className="min-h-20 resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={control}
          name={latitudeName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude</FormLabel>
              <FormControl>
                <Input type="number" step="any" placeholder="14.5995" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={longitudeName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude</FormLabel>
              <FormControl>
                <Input type="number" step="any" placeholder="120.9842" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormDescription>
        Use your maps app to copy latitude and longitude for your location.
      </FormDescription>
    </>
  )
}
