# Declarative TSX

Declarative TSX components developed for Timma SaaS client codebase

## Acknowledgements

Library boilerplate starter: https://github.com/alexjoverm/typescript-library-starter

## Dependencies

##Examples

### DataTable

```
<DataTable data={data} initialSortField={"first_name"}>
{(data, { Table, THead, TBody, SortHeader }) => {
    return (
    <Fragment>
        <THead>
        <tr>
            <SortHeader field="first_name">First name</SortHeader>
            <SortHeader field="last_name">Last name</SortHeader>
        </tr>
        </THead>
        <TBody>
        {person => (
            <Fragment>
            <td>{person.first_name}</td>
            <td>{person.last_name}</td>
            </Fragment>
        )}
        </TBody>
    </Fragment>
    )
}}
</DataTable>
```
