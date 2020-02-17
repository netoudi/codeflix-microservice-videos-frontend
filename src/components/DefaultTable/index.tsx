import * as React from 'react';
import MUIDataTable, {
  MUIDataTableColumn,
  MUIDataTableOptions,
  MUIDataTableProps,
} from 'mui-datatables';
import { cloneDeep, merge, omit } from 'lodash';
import { MuiThemeProvider, Theme, useTheme } from '@material-ui/core';

export interface TableColumn extends MUIDataTableColumn {
  width?: string;
}

const defaultOptions: MUIDataTableOptions = {
  print: false,
  download: false,
  textLabels: {
    body: {
      noMatch: 'Nenhum registro encontrado',
      toolTip: 'Classificar',
    },
    pagination: {
      next: 'Próxima página',
      previous: 'Página anterior',
      rowsPerPage: 'Por página',
      displayRows: 'de',
    },
    toolbar: {
      search: 'Buscar',
      downloadCsv: 'Download CSV',
      print: 'Imprimir',
      viewColumns: 'Ver Colunas',
      filterTable: 'Filtrar Tabela',
    },
    filter: {
      all: 'Todos',
      title: 'FILTROS',
      reset: 'LIMPAR',
    },
    viewColumns: {
      title: 'Ver Colunas',
      titleAria: 'Ver/Esconder Colunas da Tabela',
    },
    selectedRows: {
      text: 'registro(s) selecionado(s)',
      delete: 'Excluir',
      deleteAria: 'Excluir registros selecionados',
    },
  },
};

interface DefaultTableProps extends MUIDataTableProps {
  columns: TableColumn[];
}

const DefaultTable: React.FC<DefaultTableProps> = (props) => {
  function extractMUIDataTableColumns(columns: TableColumn[]): MUIDataTableColumn[] {
    setColumnsWith(columns);
    return columns.map((column) => omit(column, 'width'));
  }

  function setColumnsWith(columns: TableColumn[]) {
    columns.forEach((column, key) => {
      if (column.width) {
        const overrides = theme.overrides as any;
        overrides.MUIDataTableHeadCell.fixedHeaderCommon[`&:nth-child(${key + 2})`] = {
          width: column.width,
        };
      }
    });
  }

  const theme = cloneDeep<Theme>(useTheme());

  const newProps = merge({ options: defaultOptions }, props, {
    columns: extractMUIDataTableColumns(props.columns),
  });

  return (
    <MuiThemeProvider theme={theme}>
      <MUIDataTable {...newProps} />
    </MuiThemeProvider>
  );
};

export default DefaultTable;
