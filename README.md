# Declarative TSX

Declarative TSX components developed for Timma SaaS client codebase

## Acknowledgements

Library boilerplate starter: https://github.com/alexjoverm/typescript-library-starter

## Dependencies

## Examples

### DataTable

```
import React, { Fragment } from "react"

import { DataTable, Selecter, Loader, Async } from "declarative-components"
const colors = ["red", "green", "blue", "yellow"] as ("red" | "green" | "blue" | "yellow")[]

interface Photo {
  albumId: number
  id: number
  title: string
  url: string
  thumbnailUrl: string
}

class App extends React.Component<{}, { lastTouch: boolean; wrapped: any }> {
  public render() {
    return (
      <Loader
        operation={() => {
          return Async.GET<Photo[]>("https://jsonplaceholder.typicode.com/photos")
        }}
      >
        {photos => (
          <Selecter options={colors}>
            {(color, setColor) => (
              <Fragment>
                <nav>
                  <select
                    value={color}
                    onChange={(e: any) => {
                      setColor(e.target.value)
                    }}
                  >
                    {colors.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </nav>
                <DataTable data={photos} rowHeight={18} anticipateRows={70} initialSortField={"title"}>
                  {(__, { THead, TBody, SortHeader }) => {
                    return (
                      <Fragment>
                        <THead>
                          <tr style={{ color }}>
                            <SortHeader style={{ textAlign: "left" }} field="title">
                              title
                            </SortHeader>
                            <SortHeader style={{ textAlign: "left" }} field="id">
                              id
                            </SortHeader>
                            <SortHeader style={{ textAlign: "left" }} field="albumId">
                              AlbumId
                            </SortHeader>
                            <SortHeader field="url">Url</SortHeader>
                          </tr>
                        </THead>
                        <TBody>
                          {photo => (
                            <Fragment>
                              <DataTable.Td>{photo.title}</DataTable.Td>
                              <DataTable.Td>{photo.id}</DataTable.Td>
                              <DataTable.Td>{photo.albumId}</DataTable.Td>
                              <DataTable.Td>{photo.url}</DataTable.Td>
                            </Fragment>
                          )}
                        </TBody>
                      </Fragment>
                    )
                  }}
                </DataTable>
              </Fragment>
            )}
          </Selecter>
        )}
      </Loader>
    )
  }
}
```
