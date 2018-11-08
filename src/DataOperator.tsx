/*
import * as _ from 'lodash'
import * as React from 'react'

export interface DataOperatorProps<T> {
  data: T[]
  children: (
    sortedData: T[],
    DataTable: {
      Sort: (props: SortProps<T>) => JSX.Element
    },
    queryString: string,
    onSearch: (queryString: string) => void
  ) => JSX.Element
  initialSortField: keyof T
}
export interface DataOperatorState<T> {
  sortField: keyof T
  sortDirection: 'desc' | 'asc'
  searchString: string
  sortedData: T[]
}

export interface SortProps<T> {
  children: (sortDirection: 'desc' | 'asc' | 'none', toggleSort: () => void) => JSX.Element
  field: keyof T
}

export class DataOperator<T> extends React.PureComponent<DataOperatorProps<T>, DataOperatorState<T>> {
  state: DataOperatorState<T> = {
    searchString: '',
    sortDirection: 'desc',
    sortField: this.props.initialSortField,
    sortedData: this.props.data
  }

  Sort = (props: SortProps<T>) => {
    return props.children(this.state.sortField === props.field ? this.state.sortDirection : 'none', () => {
      this.onSortFieldClick(props.field)
    })
  }
  onSortFieldClick = (sortField: keyof T) => {
    if (sortField === this.state.sortField) {
      this.setState(
        {
          sortDirection: this.state.sortDirection === 'asc' ? 'desc' : 'asc'
        },
        () => {
          this.reSortAndGroup()
        }
      )
    } else {
      this.setState(
        {
          sortDirection: 'desc',
          sortField
        },
        () => {
          this.reSortAndGroup()
        }
      )
    }
  }
  onSearchStringChange = (searchString: string) => {
    this.setState(
      {
        searchString
      },
      () => {
        this.reSortAndGroup()
      }
    )
  }
  reSortAndGroup() {
    let sortedData = this.props.data.slice()
    if (this.state.searchString.length > 0) {
      sortedData = sortedData.filter((d: any) => {
        const a = _.map(d, val => {
          if (typeof val === 'string') {
            return val.toLowerCase().indexOf(this.state.searchString.toLowerCase()) !== -1
          } else {
            return false
          }
        })
        return a.reduce((acc, val) => {
          return acc || val
        }, false)
      })
    }
    if (this.state.sortField) {
      sortedData = _.sortBy(sortedData, this.state.sortField)
    }
    sortedData = this.state.sortDirection === 'asc' ? sortedData : _.reverse(sortedData)
    this.setState({
      sortedData
    })
  }
  componentDidUpdate(prevProps: any) {
    if (this.props.data !== prevProps.data) {
      this.reSortAndGroup()
    }
  }
  render() {
    return this.props.children(
      this.state.sortedData,
      {
        Sort: this.Sort
      },
      this.state.searchString,
      this.onSearchStringChange
    )
  }

  componentDidMount() {
    this.reSortAndGroup()
  }
}
*/
