import * as React from 'react';
import MUIDataTable, { MUIDataTableOptions, MUIDataTableProps } from 'mui-datatables';
import { merge } from 'lodash';

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

type DefaultTableProps = MUIDataTableProps;

const DefaultTable: React.FC<DefaultTableProps> = (props) => {
  const newProps = merge({ options: defaultOptions }, props);

  return <MUIDataTable {...newProps} />;
};

export default DefaultTable;
